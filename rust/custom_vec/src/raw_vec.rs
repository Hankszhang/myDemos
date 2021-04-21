use std::{
    alloc::{handle_alloc_error, Allocator, Global, Layout},
    mem,
    ptr::{NonNull, Unique},
};

pub struct RawVec<T> {
    pub ptr: Unique<T>,
    pub cap: usize,
}

impl<T> RawVec<T> {
    pub fn new() -> Self {
        // !0 is usize::MAX. This branch should be stripped at compile time.
        let cap = if mem::size_of::<T>() == 0 { !0 } else { 0 };

        // Unique::dangling() doubles as "unallocated" and "zero-sized allocation"
        RawVec {
            ptr: Unique::dangling(),
            cap: cap,
        }
    }

    pub fn grow(&mut self) {
        // this is all pretty delicate, so let's say it's all unsafe
        unsafe {
            let elem_size = mem::size_of::<T>();

            // since we set the capacity to usize::MAX when elem_size is
            // 0, getting to here necessarily means the Vec is overfull.
            assert!(elem_size != 0, "capacity overflow");

            let (new_cap, ptr) = if self.cap == 0 {
                let ptr = Global.allocate(Layout::array::<T>(1).unwrap());
                (1, ptr)
            } else {
                // as an invariant, we can assume that `self.cap < isize::MAX`,
                // so this doesn't need to be checked.
                let new_cap = 2 * self.cap;
                // Similarly this can't overflow due to previously allocating this
                let old_num_bytes = self.cap * elem_size;

                // check that the new allocation doesn't exceed `isize::MAX` at all
                // regardless of the actual size of the capacity. This combines the
                // `new_cap <= isize::MAX` and `new_num_bytes <= usize::MAX` checks
                // we need to make. We lose the ability to allocate e.g. 2/3rds of
                // the address space with a single Vec of i16's on 32-bit though.
                // Alas, poor Yorick -- I knew him, Horatio.
                assert!(
                    old_num_bytes <= (isize::MAX as usize) / 2,
                    "capacity overflow"
                );

                let c: NonNull<T> = self.ptr.into();

                let ptr = Global.grow(
                    c.cast(),
                    Layout::array::<T>(self.cap).unwrap(),
                    Layout::array::<T>(new_cap).unwrap(),
                );
                (new_cap, ptr)
            };

            // If allocate or reallocate fail, oom
            if ptr.is_err() {
                handle_alloc_error(Layout::from_size_align_unchecked(
                    new_cap * elem_size,
                    mem::align_of::<T>(),
                ))
            }

            let ptr = ptr.unwrap();

            self.ptr = Unique::new_unchecked(ptr.as_ptr() as *mut _);
            self.cap = new_cap;
        }
    }
}

impl<T> Drop for RawVec<T> {
    fn drop(&mut self) {

        // don't free zero-sized allocations, as they were never allocated.
        if self.cap != 0 && mem::size_of::<T>() != 0 {
            unsafe {
                let c: NonNull<T> = self.ptr.into();
                Global.deallocate(c.cast(), Layout::array::<T>(self.cap).unwrap());
            }
        }
    }
}
