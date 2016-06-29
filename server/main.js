// Static Maps
MapDDS.add({
  name: 'third',
  tilesetName: 'elements',
  chunkWidth: 4,
  chunkHeight: 5,
});


MapDDS.get('third').onNewChunk(function(chunk, callback) {
  for (let i = 0; i < this.chunkSize; i++) {
    chunk[i] = [10];
  }
  callback(null, chunk);
});
