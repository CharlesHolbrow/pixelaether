import { ReactiveVar }  from 'meteor/reactive-var';
import { Coord }        from './Coord.js';

export class ReactiveCoord extends Coord {

  get cx() { return this.rcx.get(); }
  set cx(v) { if (this.rcx) this.rcx.set(v); else this.rcx = new ReactiveVar(v); }

  get cy() { return this.rcy.get(); }
  set cy(v) { if (this.rcy) this.rcy.set(v); else this.rcy = new ReactiveVar(v); }

  get tx() { return this.rtx.get(); }
  set tx(v) { if (this.rtx) this.rtx.set(v); else this.rtx = new ReactiveVar(v); }

  get ty() { return this.rty.get(); }
  set ty(v) { if (this.rty) this.rty.set(v); else this.rty = new ReactiveVar(v); }
}
