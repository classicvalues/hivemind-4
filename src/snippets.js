/**
 * Contains small code snippets for use in the console. Do not require this file.
 */
/* global FIND_CONSTRUCTION_SITES */

// Remove all constructions sites in a roon you have vision in:
_.forEach(Game.rooms.E49S48.find(FIND_CONSTRUCTION_SITES), s => s.remove());

// Show CPU usage for all processes for 100 ticks.
Memory.hivemind.showProcessDebug = 100;

// Draw room planner debug visuals for 100 ticks.
Game.rooms.E49S51.roomPlanner.memory.drawDebug = 100;

// Re-run room planner for a room.
Game.rooms.E49S51.roomPlanner.memory.plannerVersion = 0;

// Find out which processes use a lot of CPU
JSON.stringify(_.sortBy(_.map(Memory.hivemind.process, (a, b) => {a.name = b; return a}), a => -a.cpu));

// Find out which operations use a lot of CPU
const m = []; _.each(Memory.operations, (o, name) => {m.push({name, cpu: o.stats.cpu / o.statTicks})}); JSON.stringify(_.sortBy(m, 'cpu'));

// Find out which mining operations are most profitable per CPU used
const m = []; _.each(Memory.operations, (o, name) => {if (o.type !== 'mining') return; m.push({name, income: o.stats.energy / o.stats.cpu})}); JSON.stringify(_.sortBy(m, 'income'));

// Find out where a lot of memory is used:
JSON.stringify(_.sortBy(_.map(Memory, (data, key) => {return {key, size: JSON.stringify(data).length}}), 'size'));
JSON.stringify(_.reduce(_.map(Memory.rooms, (roomData) => {const result = {}; _.each(roomData, (data, key) => result[key] = JSON.stringify(data).length); return result}), (total, item) => {_.each(item, (value, key) => total[key] = (total[key] || 0) + value); return total}));

// Calculate room value.
const p = new (require('process.strategy.scout')); p.generateMineralStatus(); Memory.hivemind.canExpand = true; const r = []; _.each(Game.rooms, room => {if (!room.isMine()) return; const i = p.calculateExpansionScore(room.name);i.roomName = room.name; r.push(i)}); Memory.hivemind.canExpand = false; console.log(JSON.stringify(r));

// Find energy source options for a transporter creep.
JSON.stringify(_.map(Game.creeps.T_ju.getAvailableEnergySources(), option => {option.object = (option.object || {}).id; return option}))

// Find out how many creeps of each role are currently spawned.
_.each(Game.creepsByRole, (g, n) => console.log(_.size(g), n));

// Force expansion to a certain room.
const ep = require('process.strategy.expand'); p = new ep({}, {}); r = Memory.strategy.roomList.E19N24; r.spawnRoom = 'E16N22'; p.startExpansion(r)

// Send a squad to operate in a room.
const Squad = require('manager.squad'); const s = new Squad('squadName'); s.setSpawn('W25S18'); s.setTarget(new RoomPosition(24, 24, 'W28S19')); a.addUnit('ranger');
