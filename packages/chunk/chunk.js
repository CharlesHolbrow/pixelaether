export class Chunk {

  static idToCxy(id) {
    const cxyArr = id.split('_');
    if (cxyArr.length < 2) return null;
    const cxStr = cxyArr[0];
    const cyStr = cxyArr[1];
    // We know these two strings exist. We do not now if they
    // are parsable;
    const cx = parseInt(cxStr, 36);
    const cy = parseInt(cyStr, 36);
    // check for NaN
    if (cy !== cy || cx !== cx) return null;
    return { cx, cy };
  }

  static cxyToId(cxy) {
    if (typeof cxy.cx !== 'number' || typeof cxy.cy !== 'number')
      throw new Error('.cx and .cy must be numbers');
    return `${cxy.cx.toString(36)}_${cxy.cy.toString(36)}`;
  }
}
