# Location

This package "extends" the Addr class to include, and adds
support for serverId, and mapName. An example instance includes
the following data:

```
{
  serverId: 'asdfasdfasdfasdf'
  mapName: 'home sweet home',
  cx: 0,
  cy:0
  tx:0,
  ty:0,
  _id: asdfasdf_asdfasdfkj // consider the implications of having locations with IDs that are stored in a mongo collection
}
```

## Testing

cd into the package dir, and run:

```
$ meteor test-packages ./ --driver-package practicalmeteor:mocha
```