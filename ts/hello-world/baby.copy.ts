export class Baby {
    private name: string;
    constructor(name: string) {
        this.name = name;
        console.log('baby is crying, wawawawwa~~~~~~~~~')
    }

    static smile() {
        console.log('O(∩_∩)O！')
    }

    public getBabyName(): string {
        return this.name;
    }
}

export let baby = new Baby('Eleven');