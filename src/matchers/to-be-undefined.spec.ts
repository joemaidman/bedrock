import Expectation from '../expectation/expectation';

describe('GIVEN toBeUndefined is called', () => {
    let expectation;
    describe('WHEN a true expectation is made', () => {
        it('THEN it evaluates to true', () => {
            expectation = new Expectation(undefined, 'Description');
            expect(expectation.toBeUndefined()).toBeTruthy();
        });
    });

    describe('WHEN a false expectation is made', () => {
        it('THEN it evaluates to false', () => {
            expectation = new Expectation(1, 'Description');
            expect(expectation.toBeUndefined()).toBeFalsy();
        });
    });
});
