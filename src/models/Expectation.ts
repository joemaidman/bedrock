import { stub } from './Core';
import { expect } from 'chai';
import Reporter from './Reporter';
import Report from './Report';
import MessageType from './MessageType';
import Counter from './Counter';
import * as R from 'ramda';

class Expectation {

    subject: any;
    expected: any;
    counter: number;
    des: string;
    messages: Array<Report>;
    not: Expectation;
    isNot: boolean;
    throwsArgs: Array<any>;

    constructor(subject: any, counter: number, des: string, isNot: boolean = false) {
        Counter.incrementTestCount();
        this.subject = subject;
        this.counter = counter;
        this.des = des;
        this.messages = new Array<Report>();
        this.isNot = isNot;
        if (isNot === false) {
            this.not = new Expectation(this.subject, counter, des, true);
        }
    }

    checkType = (name: string | Array<string>): void => {
        typeof name === 'string'
            ? name = [name]
            : name = name;
        if (!this.subject.constructor
            || !R.contains(this.subject.constructor.name, name)) {
            throw new Error('Subject is not a '
                + name.join('/')
                + ' object');
        }
    }

    toBe = (objectToMatch: any): boolean => {
        this.expected = objectToMatch;
        return this.assert(this.subject === objectToMatch);
    }

    toEqual = (objectToMatch: any): boolean => {
        this.expected = objectToMatch;
        return this.assert(this.subject === objectToMatch);
    }

    toBeDefined = (): boolean => {
        this.expected = Object;
        return this.assert(typeof (this.subject) !== "undefined");
    }

    toBeUndefined = (): boolean => {
        this.expected = Object;
        return this.assert(typeof (this.subject) === "undefined");
    }

    toBeNotNull = (): boolean => {
        this.expected = Object;
        return this.assert(this.subject !== null);
    }

    toBeNull = (): boolean => {
        this.expected = Object;
        return this.assert(this.subject === null);
    }

    toBeGreaterThanOrEqualTo = (objectToMatch: any): boolean => {
        this.expected = objectToMatch;
        return this.assert(this.subject >= this.expected);
    }

    toBeLessThanOrEqualTo = (objectToMatch: any): boolean => {
        this.expected = objectToMatch;
        return this.assert(this.subject <= this.expected);
    }

    toBeGreaterThan = (objectToMatch: any): boolean => {
        this.expected = objectToMatch;
        return this.assert(this.subject > this.expected);
    }

    toBeLessThan = (objectToMatch: any): boolean => {
        this.expected = objectToMatch;
        return this.assert(this.subject < this.expected);
    }

    toBeBetweenInclusive = (min: number, max: number): boolean => {
        this.expected = Object;
        return this.assert(this.subject >= min && this.subject <= max);
    }

    toBeBetweenExclusive = (min: number, max: number): boolean => {
        this.expected = Object;
        return this.assert(this.subject > min && this.subject < max);
    }

    toBeTypeOf = (type: string): boolean => {
        this.expected = type;
        return this.assert(this.subject.constructor.name.toLowerCase() === type.toLowerCase());
    }

    toRespondTo = (functionName: string): boolean => {
        this.expected = functionName;
        // What about properties?
        return typeof this.subject[functionName] === 'function';
    }

    toHaveLength = (length: number): boolean => {
        this.expected = length;
        if (this.subject.constructor.name === 'Array') {
            return this.assert(this.subject.length === length);
        }
        else if (this.subject.constructor.name === "Set"
            || this.subject.constructor.name === "Map") {
            return this.assert(this.subject.size === length);
        }
        return this.assert(false);
    }

    toBeFalsey = (): boolean => {
        return this.assert(!this.subject);
    }

    toBeTruthy = (): boolean => {
        return this.assert(this.subject);
    }

    toBeCloseToInclusive = (target: number, delta: number): boolean => {
        const min = target - delta;
        const max = target + delta;
        return this.assert(this.subject >= min && this.subject <= max);
    }

    toBeCloseToExclusive = (target: number, delta: number): boolean => {
        const min = target - delta;
        const max = target + delta;
        return this.assert(this.subject > min && this.subject < max);
    }

    toContain = (item: any): boolean => {
        this.expected = item;
        //This should work for objects too
        if (this.subject.constructor.name === 'Array') {
            return this.assert(this.subject.includes(item));
        }
        else if (this.subject.constructor.name === "Set") {
            return this.assert(this.subject.has(item));
        }
        else {
            this.messages.push(new Report(['Subject is a '
                + this.subject.constructor.name
                + ', not an Array or Set']
                , MessageType.COMPARISON
                , this.counter));

            return this.assert(false);
        }
    }

    toThrow = (message: string): boolean => {
        this.expected = message;
        let didThrow: boolean = false;
        let thrownMessage: string = '';
        try {

            this.throwsArgs
                ? this.subject(this.throwsArgs)
                : this.subject();
        }
        catch (e) {
            didThrow = true;
            thrownMessage = e;
        }
    
        return this.assert(didThrow === true
            && thrownMessage === message)
    }

    with = function (): boolean {
        this.throwsArgs = Array.prototype.slice.call(arguments);
        return this;
    }

    toThrowError = (type: any, message: string): boolean => {
        this.expected = message;
        let thrownType: any = 'Error';
        let didThrow: boolean = false;
        let thrownMessage: string = '';
        let errorType: any;
        try {
            this.subject();
        }
        catch (e) {
            didThrow = true;
            thrownType = e.name;
            thrownMessage = e.message;
        }

        return this.assert(didThrow === true
            && thrownMessage === message
            && thrownType === type.name)
    }

    toHaveKey = (item: any): boolean => {
        //This should work for objects too
        return this.assert(this.subject.has(item));
    }

    toHaveBeenCalled = (times: number): boolean => {
        this.checkType('Spy');
        this.expected = times;
        return this.assert(this.subject.getCallCount() === times);
    }

    toHaveBeenCalledWith = function (): boolean {
        this.checkType('Spy');
        this.expected = arguments;
        return this.assert(
            R.contains(
                Array.prototype.slice.call(arguments),
                this.subject.getCallHistory()
            ));
    }

    assert = (x: boolean): boolean => {
        if (this.isNot ? x : !x) {
            Reporter.getInstance().report(new Report([this.des], MessageType.ERROR, this.counter));
            if (this.subject) {
                Reporter.getInstance().report(new Report(['Expected', this.expected,
                    ' => ',
                    this.expected.constructor.name,
                    ' | Actual: ',
                    this.subject,
                    ' => ',
                    this.subject.constructor.name],
                    MessageType.COMPARISON,
                    this.counter));
            }
            else {
                Reporter.getInstance().report(new Report(['Expected',
                    this.expected,
                    ' => ',
                    this.expected.constructor.name,
                    ' | Actual: ', this.subject],
                    MessageType.COMPARISON,
                    this.counter));
            }
            Counter.incrementFailCount();
            return false;
        }
        else {

            Reporter.getInstance().report(new Report([this.des], MessageType.OK, this.counter));
            this.messages.forEach((message: Report) => {
                Reporter.getInstance().report(message);
            });
            Counter.incrementPassCount();
            return true;
        }
    }
}

export default Expectation;