import Expectation from '../expectation/expectation';
import { toBeFalsey } from './to-be-falsey';

describe('GIVEN toBeDefined is called', () => {
    let expectation;
    describe('WHEN a true expectation is made', () => {
        it('THEN it evaluates to true', () => {
            expectation = new Expectation(1, 'Description');
            expect(expectation.toBeDefined()).toBeTruthy();
        });
    });

    describe('WHEN a false expectation is made', () => {
        it('THEN it evaluates to false', () => {
            expectation = new Expectation(undefined, 'Description');
            expect(expectation.toBeDefined()).toBeFalsy();
        });
    });
});
