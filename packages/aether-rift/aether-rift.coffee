### ------------------------------------------------------------
AetherRift is similar to Rift, except it uses serverId instead
of urls. This lets us choose which interface we want to use.

If you want to use the url interface, use Rift.<method>.

Instead of "inheriting" from Rift. I'm going to just duplicate
all the methods here. This Avoids bugs from async edge cases at
the expense of duplicating code.

CAUTION:
This package written as part of a refactor moving toward using
serverIds to identify servers instead of URLs. Once that
refactor is complete it might make sense to re-structure this
package along with the `rift`, `game-servers-shared` and
`game-servers` packages.

Like Rift, AetherRift is a pseudo-singleton. Don't call
new AetherRift. Instead just use AetherRift.add() etc

add(serverId)
call(methodName)
collection(name, serverId)
connection(serverId)
list()
methods(methods)
open(serverId, wait)
status(serverId)
url()
userId(serverId)
------------------------------------------------------------ ###

AetherRift = {}

getUrlOrThrow = (serverId)=>
  url = GameServers.idToUrl(serverId)
  if url then return url
  throw new Meteor.Error 'bad-id', 'AetherRift fail. ServerId not found: ' + serverId

getUrlReactive = (serverId)=>
  return GameServers.idToUrl(serverId)

AetherRift.getId = ()=>
  url = Rift.url()
  if not url
    throw new Meteor.Error 'aether-rift error', 'Failed to get id - Rift.url() did not return a url.'
  return GameServers.idToUrl url

AetherRift.add = (serverId)=>
  Rift.add getUrlOrThrow(serverId)

AetherRift.call = (args...)=>
  Rift.call.apply(Rift, args)

AetherRift.collection = (name, serverId)=>
  if serverId
    url = getUrlOrThrow(serverId)
  Rift.collection(name, url)

AetherRift.connection = (serverId)=>
  if serverId then return Rift.connection getUrlOrThrow(serverId)
  else return Rift.connection()

AetherRift.list = ()=>
  Rift.list()

AetherRift.methods = (methods)=>
  Rift.methods methods

AetherRift.open = (serverId, wait)=>
  url = getUrlOrThrow(serverId)
  Rift.open url, wait

AetherRift.status = (serverId)=>
  if serverId then return Rift.status getUrlOrThrow(serverId)
  else return Rift.status()

AetherRift.url = ()=>
  Rift.url()

AetherRift.userId = (serverId)=>
  if serverId then return Rift.userId getUrlOrThrow(serverId)
  else return Rift.userId()
