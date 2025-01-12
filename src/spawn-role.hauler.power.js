'use strict';

/* global hivemind CREEP_LIFE_TIME CREEP_SPAWN_TIME MAX_CREEP_SIZE MOVE CARRY */

const SpawnRole = require('./spawn-role');

module.exports = class PowerHaulerSpawnRole extends SpawnRole {
	/**
	 * Adds gift spawn options for the given room.
	 *
	 * @param {Room} room
	 *   The room to add spawn options for.
	 * @param {Object[]} options
	 *   A list of spawn options to add to.
	 */
	getSpawnOptions(room, options) {
		if (!hivemind.settings.get('enablePowerMining')) return;
		if (!Memory.strategy || !Memory.strategy.power || !Memory.strategy.power.rooms) return;

		_.each(Memory.strategy.power.rooms, (info, roomName) => {
			if (!info.isActive) return;
			if (!info.spawnRooms[room.name]) return;

			// @todo Determine supposed time until we crack open the power bank.
			// Then we can stop spawning attackers and spawn haulers instead.
			const travelTime = 50 * info.spawnRooms[room.name].distance;
			const timeToKill = 0.8 * info.hits / info.dps;
			if (timeToKill > (CREEP_SPAWN_TIME * MAX_CREEP_SIZE) + Math.max(CREEP_LIFE_TIME / 3, travelTime)) return;

			// Time to spawn haulers!
			const powerHaulers = _.filter(Game.creepsByRole['hauler.power'] || {}, creep => creep.memory.targetRoom === roomName);
			const totalCapacity = _.reduce(powerHaulers, (total, creep) => total + creep.carryCapacity, 0);

			if (totalCapacity < info.amount * 1.2) {
				options.push({
					priority: hivemind.settings.get('powerMineCreepPriority'),
					weight: 0.5,
					targetRoom: roomName,
				});
			}
		});
	}

	/**
	 * Gets the body of a creep to be spawned.
	 *
	 * @param {Room} room
	 *   The room to add spawn options for.
	 * @param {Object} option
	 *   The spawn option for which to generate the body.
	 *
	 * @return {string[]}
	 *   A list of body parts the new creep should consist of.
	 */
	getCreepBody(room) {
		const moveRatio = hivemind.settings.get('powerHaulerMoveRatio');
		return this.generateCreepBodyFromWeights(
			{[MOVE]: moveRatio, [CARRY]: 1 - moveRatio},
			Math.max(room.energyCapacityAvailable * 0.9, room.energyAvailable)
		);
	}

	/**
	 * Gets memory for a new creep.
	 *
	 * @param {Room} room
	 *   The room to add spawn options for.
	 * @param {Object} option
	 *   The spawn option for which to generate the body.
	 *
	 * @return {Object}
	 *   The boost compound to use keyed by body part type.
	 */
	getCreepMemory(room, option) {
		return {
			sourceRoom: room.name,
			targetRoom: option.targetRoom,
		};
	}
};
