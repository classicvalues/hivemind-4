'use strict';

/* global hivemind FIND_HOSTILE_CREEPS FIND_MY_STRUCTURES STRUCTURE_RAMPART */

const Role = require('./role');

const filterEnemyCreeps = c => !hivemind.relations.isAlly(c.owner.username) && c.isDangerous();

module.exports = class GuardianRole extends Role {
	constructor() {
		super();

		// Guardians have high priority because of their importance to room defense.
		this.stopAt = 0;
		this.throttleAt = 0;
	}

	/**
	 * Makes a creep behave like a guardian.
	 *
	 * @param {Creep} creep
	 *   The creep to run logic for.
	 */
	run(creep) {
		const rampart = this.getBestRampartToCover(creep);

		if (creep.pos.getRangeTo(rampart.pos) > 0) {
			creep.goTo(rampart.pos);
		}

		this.attackTargetsInRange(creep);
	}

	getBestRampartToCover(creep) {
		// @todo Make sure we can find a safe path to the rampart in question.
		const targets = creep.room.find(FIND_HOSTILE_CREEPS, 1, {
			filter: filterEnemyCreeps,
		});

		const ramparts = [];
		for (const target of targets) {
			const closestRampart = target.pos.findClosestByRange(FIND_MY_STRUCTURES, {
				filter: s => s.structureType === STRUCTURE_RAMPART,
			});
			if (ramparts.indexOf(closestRampart) === -1) ramparts.push(closestRampart);
		}

		return _.min(ramparts, s => s.pos.getRangeTo(creep.pos) + s.pos.getRangeTo(s.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
			filter: filterEnemyCreeps,
		})));
	}

	attackTargetsInRange(creep) {
		// @todo Ask military manager for best target for joint attacks.
		const targets = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 1, {
			filter: filterEnemyCreeps,
		});
		if (targets.length === 0) return;

		creep.attack(targets[0]);
	}
};
