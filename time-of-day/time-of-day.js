// time-of-day initializera a de
import { Meteor }       from 'meteor/meteor';
import { ReactiveVar }  from 'meteor/reactive-var';
import { Tracker }      from 'meteor/tracker';
import { GameTicker }   from './GameTicker.js';
import { check }        from 'meteor/check';


const rTimeOfDay = new ReactiveVar();
const ticker = new GameTicker(2000, true, (tick) => {
  // 1 game day === 15 min
  // 1 game day === 15 * 60 seconds
  // 1 game day === 15 * 60 / 2 ticks (assume 2 second ticks)
  // 1 game day === 450 ticks of 2 seconds
  const state = Math.floor(tick % (15 * 60 / 2));
  rTimeOfDay.set(state);
});


Meteor.publish('time', function(addr) {
  check(addr, { mapName: String });

  const time = rTimeOfDay.get();
  this.added('time', addr.mapName, { time });

  const comp = Tracker.autorun((comp) => {
    const time = rTimeOfDay.get();
    if (comp.firstRun) return;
    this.changed('time', addr.mapName, { time });
  });

  this.ready();

  this.onStop(() => { comp.stop(); });
});
