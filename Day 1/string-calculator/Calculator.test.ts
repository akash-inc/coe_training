import * as Calculator from "./index";

describe('Calculator', () => {
    let calculator: Calculator.Calculator;

    beforeEach(() => {
        calculator = new Calculator.Calculator();
    });

    test("Calculator class exists", () => {
        expect(Calculator.Calculator).toBeDefined();
    });

    test("Calculator class has add method", () => {
        expect(calculator.add).toBeDefined();
    });

    test("Calculator class has getCalledCount method", () => {
        expect(calculator.getCalledCount).toBeDefined();
    });

    describe('Add method', () => {

        test('Accepts a string as an argument', () => {
            expect(() => calculator.add('')).not.toThrow();
            expect(() => calculator.add('1,2')).not.toThrow();
        });

        test('Returns correct sum with correct type', () => {
            expect(calculator.add('1,2')).toBe(3);
            expect(typeof (calculator.add('1,3'))).toBe('number');
        });

        test('Accepts more than two numbers', () => {
            expect(calculator.add('1,2,3')).toBe(6);
        });

        describe('Delimiter support', () => {

            test('Supports custom delimiter specified at the start', () => {
                expect(calculator.add('//;\n1;2')).toBe(3);
                expect(calculator.add('//|\n1|2|3')).toBe(6);
            });

            test('Supports custom delimiter of any length', () => {
                expect(calculator.add('//[***]\n1***2***3')).toBe(6);
                expect(calculator.add('//[----]\n1----2----3')).toBe(6);
                expect(calculator.add('//[##]\n1##2##3')).toBe(6);
            });

            test('Supports new line as delimiter', () => {
                expect(calculator.add('1\n2,3')).toBe(6);
            });

            test('Supports multiple custom delimiters of any length', () => {
                expect(calculator.add('//[*][%]\n1*2%3')).toBe(6);
                expect(calculator.add('//[***][%%%]\n1***2%%%3')).toBe(6);
                expect(calculator.add('//[##][$$]\n1##2$$3')).toBe(6);
            });
        });

        test('Throws an error for negative numbers', () => {
            expect(() => calculator.add('-1,2')).toThrow('negative numbers not allowed -1');
        });

        test('Throws an error with multiple negative numbers', () => {
            expect(() => calculator.add('-1,-2,3')).toThrow('negative numbers not allowed -1,-2');
        });

        test('Number bigger than 1000 should be ignored', () => {
            expect(calculator.add('//;\n1001;2;3')).toBe(5);
            expect(calculator.add('//;\n2005;2;3')).toBe(5);
        });
    });

    describe('getCalledCount method', () => {

        test('getCalledCount returns number of times add was called', () => {
            expect(calculator.getCalledCount()).toBe(0);

            calculator.add('1,2');
            expect(calculator.getCalledCount()).toBe(1);

            calculator.add('3,4');
            expect(calculator.getCalledCount()).toBe(2);

            calculator.add('');
            expect(calculator.getCalledCount()).toBe(3);
        });
    });
});
