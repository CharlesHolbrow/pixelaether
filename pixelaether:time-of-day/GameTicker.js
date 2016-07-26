export class GameTicker {

  constructor(tickDurationInMs, startImmediately = true, cb) {
    this.tickDurationInMs = tickDurationInMs;
    this.cb = cb;
    const now = new Date().getTime(); // UTC milliseconds
    this.tickNumber = Math.floor(now / tickDurationInMs) - 1;
    if (startImmediately) this.run();

  }

  // Try to take the next step. Only take the next step if
  // this.tickDurationInMs milliseconds have elapsed since the
  // last scheduled tick.
  step() {
    const now = new Date().getTime();
    const newTickNumber = Math.floor(now / this.tickDurationInMs);
    const ticksBetweenNowAndLastTick = newTickNumber - this.tickNumber;

    // We want exactly one tick to have elapsed since the last tick
    if (ticksBetweenNowAndLastTick > 1) {
      console.warn(`Large tick step: ${ticksBetweenNowAndLastTick}`);
    } else if (ticksBetweenNowAndLastTick === 0) {
      console.warn('Empty Tick');
      return 0;
    }
    this.tickNumber = newTickNumber;

    if (typeof this.cb === 'function') {
      this.cb(newTickNumber, ticksBetweenNowAndLastTick);
    }

    return ticksBetweenNowAndLastTick;
  }

  msUntilNextTick() {
    const now = new Date().getTime(); // UTC milliseconds
    return this.tickDurationInMs - (now % this.tickDurationInMs);
  }

  run() {
    this.step();
    Meteor.clearTimeout(this.timeout);
    this.timeout = Meteor.setTimeout(() => {
      this.run();
    }, this.msUntilNextTick());
  }

  stop() {
    Meteor.clearTimeout(this.timeout);
  }
}
