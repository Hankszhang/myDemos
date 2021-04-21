use crate::{raw_val_iter::RawValIter, raw_vec::RawVec, Vec};
use std::{mem, ptr};

pub struct IntoIter<T> {
    _buf: RawVec<T>,
    iter: RawValIter<T>,
}

impl<T> Vec<T> {
    pub fn into_iter(self) -> IntoIter<T> {
        unsafe {
            // need to use ptr::read to unsafely move the buf out since it's
            // not Copy, and Vec implements Drop (so we can't destructure it).
            let iter = RawValIter::new(&self);
            let buf = ptr::read(&self.buf);

            // Make sure not to drop Vec since that will free the buffer
            mem::forget(self);

            IntoIter { iter, _buf: buf }
        }
    }
}

impl<T> Iterator for IntoIter<T> {
    type Item = T;

    fn next(&mut self) -> Option<Self::Item> {
        self.iter.next()
    }

    fn size_hint(&self) -> (usize, Option<usize>) {
        self.iter.size_hint()
    }
}

impl<T> DoubleEndedIterator for IntoIter<T> {
    fn next_back(&mut self) -> Option<T> {
        self.iter.next_back()
    }
}

impl<T> Drop for IntoIter<T> {
    fn drop(&mut self) {
        // only need to ensure all our elements are read;d
        // buffer will clean itself up afterwards.
        for _ in &mut *self {}
    }
}
