import * as _ from 'underscore';

export function getMaxRepeatValue (arr: Array<string>): string {
    var obj: MaxRepeatObject = {
        max: {
            count: 0, 
            value: ''
        }
    };

    _.shuffle(arr).forEach((val: string) => {
        obj[val] = obj[val] || 0;
        obj[val]++;
        
        if(obj[val] > obj.max.count) {
            obj.max.count = obj[val];
            obj.max.value = val;
        }
    });
    
    return obj.max.value;
}

interface MaxRepeatObject {
    max: {
        count: number;
        value: string;
    }
}