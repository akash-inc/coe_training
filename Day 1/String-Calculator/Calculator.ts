export class Calculator {
    private callCount: number = 0;

    add(numbers: string): number {
        this.callCount++;
        const numberTokens = this.parseNumberTokens(numbers);
        return this.sumNumbers(numberTokens);
    }

    private parseNumberTokens(numbers: string): string[] {
        if (this.hasCustomDelimiter(numbers)) {
            return this.parseCustomDelimitedTokens(numbers);
        }

        return this.normalizeDefaultDelimiters(numbers).split(',');
    }

    private hasCustomDelimiter(numbers: string): boolean {
        return numbers.startsWith('//');
    }

    private parseCustomDelimitedTokens(numbers: string): string[] {
        const [delimiterLine, numbersString] = numbers.split('\n');
        const delimiterPattern = this.buildDelimiterPattern(delimiterLine);
        return numbersString.split(new RegExp(delimiterPattern));
    }

    private buildDelimiterPattern(delimiterLine: string): string {
        const delimiterMatches = delimiterLine.match(/\[(.*?)\]/g);

        if (delimiterMatches) {
            return delimiterMatches
                .map(match => match.replace(/[\[\]]/g, ''))
                .map(delim => delim.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&"))
                .join('|');
        }

        return delimiterLine.slice(2);
    }

    private normalizeDefaultDelimiters(numbers: string): string {
        return numbers.replace(/\n/g, ',');
    }

    private sumNumbers(numberStrings: string[]): number {
        const numbersArray = numberStrings.map(Number).filter(num => num <= 1000);
        const negatives = numbersArray.filter(num => num < 0);
        if (negatives.length > 0) {
            throw new Error(`negative numbers not allowed ${negatives.join(',')}`);
        }
        return numbersArray.reduce((sum, num) => sum + num, 0);
    }

    getCalledCount(): number {
        return this.callCount;
    }
}