import {getMaxRepeatValue} from "../../src/utils/helpers";

describe('helpers', () => {

    describe('getMaxRepeatValue', () => {
        it('есть элемент повторяющийся больше всех раз', () => {
            let arr = ['1', '2', '3', '5', '2', '4', '3', '2', '0'];
    
            expect(getMaxRepeatValue(arr)).toEqual('2');
        });
        it('если нету выбрать рандомно из тех что повторяются больше всех', () => {
            let arr = ['1', '2', '3', '4', '5', '4', '9', '6', '7', '7', '2'],
                max_repeat_value = getMaxRepeatValue(arr),
                flag = max_repeat_value === '2' || max_repeat_value === '4' || max_repeat_value === '7';

            expect(flag).toBeTruthy();
        });
    });
});