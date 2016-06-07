export class Loc extends Addr {

  constructor(options) {

    if (typeof options.serverId !== 'string')
      throw new Error('Cannot create Location without a serverId. Consider using Addr instead.');

    if (typeof options.mapName !== 'string')
      throw new Error('Cannot create Location without a mapName. Consider using Addr instead.');

    super(options);

    this.serverId = options.serverId;
    this.mapName  = options.mapName;
  }

}
