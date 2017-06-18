describe("Time:", function() {

    var timePm;
    var timeAm;
    var expectedAm = [10, 49];
    var expectedPm = [15, 47];
    var t;
    var baseTime = new Date(2017, 10, 10, 10, 49);
    jasmine.clock().mockDate(baseTime);

    describe("Time.parse()", function() {
        it("Parse Date", function() {
            t = Time.parse(new Date(2017, 10, 10, 10, 49));
            expect(t).toEqual(expectedAm);
        });
        it("Parse Array", function() {
            t = Time.parse(expectedAm);
            expect(t).toEqual(expectedAm);
        });
        it("Parse Numeric (relative to current time)", function() {
            t = Time.parse(-5);
            expect(t).toEqual([5, 49]);

            t = Time.parse(+5);
            expect(t).toEqual([15, 49]);

            t = Time.parse(+48);
            expect(t).toEqual([10, 49]);

            t = Time.parse(-48);
            expect(t).toEqual([10, 49]);
        });
        it("Parse string", function() {
            t = Time.parse('now');
            expect(t).toEqual(expectedAm);

            t = Time.parse('10:49');
            expect(t).toEqual(expectedAm);

            t = Time.parse('10:49AM');
            expect(t).toEqual(expectedAm);
            t = Time.parse('10:49 AM');
            expect(t).toEqual(expectedAm);

            t = Time.parse('03:47PM');
            expect(t).toEqual(expectedPm);
            t = Time.parse('3:47 PM');
            expect(t).toEqual(expectedPm);

            t = Time.parse('gfdsgfdsgdfsg');
            expect(t).toEqual([0, 0]);
        });
        it("Return Parse etror on invalid args", function() {
            t = Time.parse(undefined);
            expect(t).toEqual('Parse error');
            t = Time.parse(null);
            expect(t).toEqual('Parse error');
            t = Time.parse(function () {
                
            });
            expect(t).toEqual('Parse error');
        });
    });
    describe("Time.now()", function() {
        it('return now has array', function() {
            expect(Time.now()).toEqual(expectedAm);
        });
    });
    describe("Time instance", function() {
        beforeEach(function() {
            timeAm = new Time('10:49');
            timePm = new Time('15:47');
        });
        it("Time.prototype.getHours: return hours (24)", function() {
            expect(timeAm.getHours()).toBe(expectedAm[0]);
            expect(timePm.getHours()).toBe(expectedPm[0]);
        });
        it("Time.prototype.setHours: set hours", function() {
            expect(timeAm.setHours(15).getHours()).toBe(15);
        });
        it("Time.prototype.isPm: return true if hours > 12", function() {
            expect(timeAm.isPm()).toBe(false);
            expect(timePm.isPm()).toBe(true);
        });
        it("Time.prototype.getTwelvHours: return twelvehour if twelvehour is true", function() {
            expect(timeAm.getTwelveHours()).toBe(10);
            expect(timePm.getTwelveHours()).toBe(15);
            timePm.twelvehour = true
            expect(timePm.getTwelveHours()).toBe(3);
        });
        it("Time.prototype.getMinutes: return minutes", function() {
            expect(timeAm.getMinutes()).toBe(expectedAm[1]);
            expect(timePm.getMinutes()).toBe(expectedPm[1]);
        });
        it("Time.prototype.setMinutes: set minutes", function() {
            expect(timeAm.setMinutes(15).getMinutes()).toBe(15);
        });
        it("Time.prototype.toString: return formated date", function() {
            expect(timeAm.toString()).toBe('10:49');
            expect(timePm.toString()).toBe('15:47');
            timeAm.twelvehour = true;
            timePm.twelvehour = true;
            expect(timeAm.toString()).toBe('10:49 AM');
            expect(timePm.toString()).toBe('03:47 PM');
        });
    });
});


