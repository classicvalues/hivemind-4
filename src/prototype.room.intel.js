'use strict';

/* global Room FIND_STRUCTURES STRUCTURE_CONTAINER STRUCTURE_LINK
STRUCTURE_LAB */

/**
* Gathers information about a rooms sources and saves it to memory for faster access.
*/
Room.prototype.scan = function () {
	const room = this;

	// Check if the controller has a container nearby.
	let structures = room.find(FIND_STRUCTURES, {
		filter: structure => structure.structureType === STRUCTURE_CONTAINER && structure.pos.getRangeTo(room.controller) <= 3,
	});
	if (structures && structures.length > 0) {
		room.memory.controllerContainer = structures[0].id;
	}
	else {
		delete room.memory.controllerContainer;
	}

	// Check if the controller has a link nearby.
	structures = room.find(FIND_STRUCTURES, {
		filter: structure => structure.structureType === STRUCTURE_LINK && structure.pos.getRangeTo(room.controller) <= 3,
	});
	if (structures && structures.length > 0) {
		room.memory.controllerLink = structures[0].id;
	}
	else {
		delete room.memory.controllerLink;
	}

	// Check if storage has a link nearby.
	if (room.storage) {
		structures = room.find(FIND_STRUCTURES, {
			filter: structure => structure.structureType === STRUCTURE_LINK && structure.pos.getRangeTo(room.storage) <= 3,
		});
		if (structures && structures.length > 0) {
			room.memory.storageLink = structures[0].id;
		}
		else {
			delete room.memory.storageLink;
		}
	}

	// Scan room for labs.
	// @todo Find labs not used for reactions, to do creep boosts.
	if (!room.memory.labsLastChecked || room.memory.labsLastChecked < Game.time - 3267) {
		room.memory.labsLastChecked = Game.time;
		room.memory.canPerformReactions = false;

		const labs = room.find(FIND_STRUCTURES, {
			filter: structure => structure.structureType === STRUCTURE_LAB && structure.isActive(),
		});
		if (labs.length >= 3) {
			// Find best 2 source labs for other labs to perform reactions.
			let best = null;
			for (const i in labs) {
				const lab = labs[i];

				const closeLabs = lab.pos.findInRange(FIND_STRUCTURES, 2, {
					filter: structure => structure.structureType === STRUCTURE_LAB && structure.id !== lab.id,
				});
				if (closeLabs.length < 2) continue;

				for (const j in closeLabs) {
					const lab2 = closeLabs[j];

					const reactors = [];
					for (const k in closeLabs) {
						const reactor = closeLabs[k];
						if (reactor === lab || reactor === lab2) continue;
						if (reactor.pos.getRangeTo(lab2) > 2) continue;

						reactors.push(reactor.id);
					}

					if (reactors.length === 0) continue;
					if (!best || best.reactor.length < reactors.length) {
						best = {
							source1: lab.id,
							source2: lab2.id,
							reactor: reactors,
						};
					}
				}
			}

			if (best) {
				room.memory.canPerformReactions = true;
				room.memory.labs = best;
			}
		}
	}
};

Room.prototype.needsScout = function () {
	if (!Memory.strategy) {
		return false;
	}

	const memory = Memory.strategy;

	for (const roomName in memory.roomList) {
		const info = memory.roomList[roomName];

		if (info.origin === this.name && info.scoutPriority >= 1) {
			return true;
		}
	}

	return false;
};