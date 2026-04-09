import { fizzBuzz } from "./fizzBuzz";

describe("fizzBuzz", () => {
    it("should return 1 when the number is 1", () => {
        expect(fizzBuzz(1)).toBe(1);
    });
    it("should return 2 when the number is 2", () => {
        expect(fizzBuzz(2)).toBe(2);
    });

    describe("when the number is divisible by 3", () => {
        it("should return Fizz when the number is 3", () => {
            expect(fizzBuzz(3)).toBe("Fizz");
        });
        it("should return Fizz when the number is 6", () => {
            expect(fizzBuzz(6)).toBe("Fizz");
        });
    });

    describe("when the number is divisible by 5", () => {
        it("should return Buzz when the number is 5", () => {
            expect(fizzBuzz(5)).toBe("Buzz");
        });
        it("should return Buzz when the number is 10", () => {
            expect(fizzBuzz(10)).toBe("Buzz");
        });
    });
    describe("when the number is divisible by 3 and 5", () => {
        it("should return FizzBuzz when the number is 15", () => {
            expect(fizzBuzz(15)).toBe("FizzBuzz");
        });
        it("should return FizzBuzz when the number is 30", () => {
            expect(fizzBuzz(30)).toBe("FizzBuzz");
        });
    });
});