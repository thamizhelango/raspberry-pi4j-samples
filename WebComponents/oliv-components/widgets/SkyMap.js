const skyMapVerbose = false;
const SKY_MAP_TAG_NAME = 'sky-map';

/**
 * WIP!!!
 *
 * Parameters:
 * - North or South
 * - With stars
 * - With star names
 * - visible sky
 * - Full sphere
 * - Wandering bodies -> requires a REST service
 * - Constellations
 * - Constellation names
 * - Star Finder or Sky Map
 * - hemisphere
 *
 * - Latitude (Observer)
 * - LHA Aries
 *
 * TODO:
 * - Wandering bodies
 * - Big Tick for the 1st of the month, in SkyMap
 * - Tweaks N/S SkyMap
 * - Displayable star names
 */

/* The map data */
import constellations from "./stars/constellations.js";
// import constellations from "./stars/constellations"; // minifyJs does NOT like the .js extension

import * as Utilities from "./utilities/Utilities.js";

const NORTHERN_HEMISPHERE = 1;
const SOUTHERN_HEMISPHERE = -1;

const STARFINDER_TYPE = 'STARFINDER';
const SKYMAP_TYPE = 'SKYMAP';

const Month = {
	JANUARY: {
		name: 'January',
		nbDays: 31
	},
	FEBRUARY: {
		name: 'February',
		nbDays: 28
	},
	MARCH: {
		name: 'March',
		nbDays: 31
	},
	APRIL: {
		name: 'April',
		nbDays: 30
	},
	MAY: {
		name: 'May',
		nbDays: 31
	},
	JUNE: {
		name: 'June',
		nbDays: 30
	},
	JULY: {
		name: 'July',
		nbDays: 31
	},
	AUGUST: {
		name: 'August',
		nbDays: 31
	},
	SEPTEMBER: {
		name: 'September',
		nbDays: 30
	},
	OCTOBER: {
		name: 'October',
		nbDays: 31
	},
	NOVEMBER: {
		name: 'November',
		nbDays: 30
	},
	DECEMBER: {
		name: 'December',
		nbDays: 31
	}
};

/* global HTMLElement */
class SkyMap extends HTMLElement {

	static get observedAttributes() {
		return [
			"width",                  // Integer. Canvas width
			"height",                 // Integer. Canvas height
			"hemisphere",             // String. N or S. Default N
			"type",                   // String SKYMAP or STARFINDER (default STARFINDER)
			"star-names",             // boolean. Default true (major stars only)
			"stars",                  // boolean. Default true.
			"constellation-names",    // boolean. Default false
			"constellations",         // boolean. Default true
			"visible-sky",            // boolean. Default true
			"latitude",               // Number [0..90], default 45, no sign! -> see hemisphere
			"lha-aries"               // Number, Default 0.

		];
	}

	dummyDump() {
		console.log('We have %d constellation(s).', constellations.length);
		for (let i=0; i<constellations.length; i++) {
			console.log("- %s: %d star(s)", constellations[i].name, constellations[i].stars.length);
			if (i === 0) {
				console.log(constellations[i]);
			}
		}
	}

	constructor() {
		super();
		this._shadowRoot = this.attachShadow({mode: 'open'}); // 'open' means it is accessible from external JavaScript.
		// create and append a <canvas>
		this.canvas = document.createElement("canvas");
		this.shadowRoot.appendChild(this.canvas);

		// For tests of the import
//	this.dummyDump();

		// Default values
		this._width       = 500;
		this._height      = 500;

		this.majorTicks = 5; // TODO prm ?
		this.minorTicks = 1; // TODO prm ?

		this.LHAAries = 0;
		this._hemisphere = NORTHERN_HEMISPHERE;

		this.observerLatitude = 45;

		this._type = STARFINDER_TYPE; // SKYMAP_TYPE;
		this._starNames = true;
		this._withStars = true;
		this._withStars = true;
		this._constellationNames = false;
		this._withConstellations = true;
		this._withVisibleSky = true;
	}

	// Called whenever the custom element is inserted into the DOM.
	connectedCallback() {
		if (skyMapVerbose) {
			console.log("connectedCallback invoked");
		}
		this.repaint();
	}

	// Called whenever the custom element is removed from the DOM.
	disconnectedCallback() {
		if (skyMapVerbose) {
			console.log("disconnectedCallback invoked");
		}
	}

	// Called whenever an attribute is added, removed or updated.
	// Only attributes listed in the observedAttributes property are affected.
	attributeChangedCallback(attrName, oldVal, newVal) {
		if (skyMapVerbose) {
			console.log("attributeChangedCallback invoked on " + attrName + " from " + oldVal + " to " + newVal);
		}
		switch (attrName) {
			case "width":
				this._width = parseInt(newVal);
				break;
			case "height":
				this._height = parseInt(newVal);
				break;
			case "hemisphere":
				this._hemisphere = (newVal === 'S' ? SOUTHERN_HEMISPHERE : NORTHERN_HEMISPHERE);
				break;
			case "type":
				this._type = newVal;
				break;
			case "stars":
				this._withStars = (newVal === 'true');
				break;
			case "star-names":
				this._starNames = (newVal === 'true');
				break;
			case "constellations":
				this._withConstellations = (newVal === 'true');
				break;
			case "constellation-names":
				this._constellationNames = (newVal === 'true');
				break;
			case "visible-sky":
				this._withVisibleSky = (newVal === 'true');
				break;
			case "latitude":
				this.observerLatitude = parseFloat(newVal);
				break;
			case "lha-aries":
				this.LHAAries = parseFloat(newVal);
				break;
			default:
				break;
		}
		this.repaint();
	}

	// Called whenever the custom element has been moved into a new document.
	adoptedCallback() {
		if (skyMapVerbose) {
			console.log("adoptedCallback invoked");
		}
	}

	set width(val) {
		this.setAttribute("width", val);
	}
	set height(val) {
		this.setAttribute("height", val);
	}
	set hemisphere(val) {
		this._hemisphere = (val === 'S' ? SOUTHERN_HEMISPHERE : NORTHERN_HEMISPHERE);
	}
	set type(val) {
		this._type = val;
	}
	set stars(val) {
		this._withStars = val;
	}
	set starNames(val) {
		this._starNames = val;
	}
	set constellations(val) {
		this._withConstellations = val;
	}
	set constellationNames(val) {
		this._constellationNames = val;
	}
	set visibleSky(val) {
		this._withVisibleSky = val;
	}
	set latitude(val) {
		this.observerLatitude = val;
	}
	set lhaAries(val) {
		this.LHAAries = val;
	}

	set shadowRoot(val) {
		this._shadowRoot = val;
	}

	get width() {
		return this._width;
	}
	get height() {
		return this._height;
	}
	get hemisphere() {
		return this._hemisphere;
	}
	get type() {
		return this._type;
	}
	get stars() {
		return this._withStars;
	}
	get starNames() {
		return this._starNames;
	}
	get constellations() {
		return this._withConstellations;
	}
	get constellationNames() {
		return this._constellationNames;
	}
	get visibleSky() {
		return this._withVisibleSky;
	}
	get latitude() {
		return this.observerLatitude;
	}
	get lhaAries() {
		return this.LHAAries;
	}

	get shadowRoot() {
		return this._shadowRoot;
	}

	/*
	 * Component methods
	 */
	repaint() {
		this.drawSkyMap();
	}

	drawSkyMap() {
		let context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);

		let radius = Math.min(this.width, this.height) * 0.99 / 2;

		// Set the canvas size from its container.
		this.canvas.width = this.width;
		this.canvas.height = this.height;

		context.beginPath();
		// White BG
		context.fillStyle = 'white';
		context.arc(this.canvas.width / 2, this.canvas.height / 2, radius, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();
		// 2 circles for LHA
		context.beginPath();
		context.lineWidth = 1;
		context.strokeStyle = 'gray';
		context.arc(this.canvas.width / 2, this.canvas.height / 2, radius * 0.98, 0, 2 * Math.PI, false);
		context.stroke();
		context.closePath();

		context.beginPath();
		context.arc(this.canvas.width / 2, this.canvas.height / 2, radius * 0.92, 0, 2 * Math.PI, false); // This one is the "horizon" (pole abaisse)
		context.stroke();
		context.closePath();


		if (this._type === STARFINDER_TYPE) { // OPTION StarFinder
			// Major ticks
			context.beginPath();
			for (let i = 0; i < 360; i++) {
				if (i % this.majorTicks === 0) {
					let currentAngle = - Utilities.toRadians(i + this.LHAAries);
					let xFrom = (this.canvas.width / 2) - ((radius * 0.98) * Math.cos(currentAngle));
					let yFrom = (this.canvas.height / 2) - ((radius * 0.98) * Math.sin(currentAngle));
					let xTo = (this.canvas.width / 2) - ((radius * 0.92) * Math.cos(currentAngle));
					let yTo = (this.canvas.height / 2) - ((radius * 0.92) * Math.sin(currentAngle));
					context.moveTo(xFrom, yFrom);
					context.lineTo(xTo, yTo);
				}
			}
			context.lineWidth = 1;
			context.strokeStyle = 'gray';
			context.stroke();
			context.closePath();

			// Minor ticks
			if (this.minorTicks > 0) {
				context.beginPath();
				for (let i = 0; i < 360; i += this.minorTicks) {
					let _currentAngle = - Utilities.toRadians(i + this.LHAAries);

					let xFrom = (this.canvas.width / 2) - ((radius * 0.98) * Math.cos(_currentAngle));
					let yFrom = (this.canvas.height / 2) - ((radius * 0.98) * Math.sin(_currentAngle));
					let xTo = (this.canvas.width / 2) - ((radius * 0.95) * Math.cos(_currentAngle));
					let yTo = (this.canvas.height / 2) - ((radius * 0.95) * Math.sin(_currentAngle));
					context.moveTo(xFrom, yFrom);
					context.lineTo(xTo, yTo);
				}
				context.lineWidth = 1;
				context.strokeStyle = 'gray';
				context.stroke();
				context.closePath();
			}

			// LHA values
			context.beginPath();
			for (let i = 0; i < 360; i++) {
				if (i % this.majorTicks === 0) {
					context.save();
					context.translate(this.canvas.width / 2, (this.canvas.height / 2)); // canvas.height);
					let __currentAngle = - Utilities.toRadians(i + this.LHAAries);
					context.rotate(__currentAngle - Math.PI);
					context.font = "bold " + Math.round(10) + "px Arial"; // Like "bold 15px Arial"
					context.fillStyle = 'black';
					let lha = (this._hemisphere === NORTHERN_HEMISPHERE || i === 0 ? i : (360 - i));
					let str = lha.toString() + '°';
					let len = context.measureText(str).width;
					context.fillText(str, -len / 2, (-(radius * .98) + 10));
					// context.lineWidth = 1;
					// context.strokeStyle = 'black';
					// context.strokeText(str, -len / 2, (-(radius * .8) + 10)); // Outlined
					context.restore();
				}
			}
			context.closePath();
		} else if (this._type === SKYMAP_TYPE) {

			// TODO WIP...

			context.beginPath();
			// 0 is 21 Sept.
			for (let day=1; day<=365; day++) {
				let now = this.findCorrespondingDay(day);
				let d = 360 * (day - 1) / 365; // The angle in the circle
				let xFrom = (this.canvas.width / 2) - ((radius * 0.98) * Math.cos(Utilities.toRadians((d - this.LHAAries) * -this._hemisphere)));
				let yFrom = (this.canvas.height / 2) - ((radius * 0.98) * Math.sin(Utilities.toRadians((d - this.LHAAries) * -this._hemisphere)));
				let xTo = (this.canvas.width / 2) - ((radius * 0.95) * Math.cos(Utilities.toRadians((d - this.LHAAries) * -this._hemisphere)));
				let yTo = (this.canvas.height / 2) - ((radius * 0.95) * Math.sin(Utilities.toRadians((d - this.LHAAries) * -this._hemisphere)));
				context.moveTo(xFrom, yFrom);
				context.lineTo(xTo, yTo);

				if (now.dayOfMonth % 5 === 0) { // Print the day #
					context.save();
					context.translate(this.canvas.width / 2, (this.canvas.height / 2));
					let __currentAngle = - Utilities.toRadians(d + this.LHAAries);
					context.rotate(__currentAngle - Math.PI);
					context.font = "bold " + Math.round(10) + "px Arial"; // Like "bold 15px Arial"
					context.fillStyle = 'black';
					let str = now.dayOfMonth.toString();
					let len = context.measureText(str).width;
					context.fillText(str, -len / 2, (-(radius * .98) + 10));
					context.restore();
				}
				if (now.dayOfMonth === Math.round(now.month.nbDays / 2)) { // Print the month name
					context.save();
					context.translate(this.canvas.width / 2, (this.canvas.height / 2));
					let __currentAngle = - Utilities.toRadians(d + this.LHAAries);
					context.rotate(__currentAngle - Math.PI);
					context.font = "bold " + Math.round(10) + "px Arial"; // Like "bold 15px Arial"
					context.fillStyle = 'red';
					let str = now.month.name;
					let len = context.measureText(str).width;
					context.fillText(str, -len / 2, (-(radius * 1.01) + 10));
					context.restore();
				}
			}
			context.lineWidth = 1;
			context.strokeStyle = 'gray';
			context.stroke();
			context.closePath();
		}

		// Full Sphere
		// Gray BG
		context.beginPath();
		context.fillStyle = 'lightGray';
		context.arc(this.canvas.width / 2, this.canvas.height / 2, radius * 0.92, 0, 2 * Math.PI, false); // This one is the "horizon" (pole abaisse)
		context.fill();
		context.closePath();

		// quarters of hours
		context.beginPath();
		for (let i = 0; i < 96; i++) {
			let currentAngle = Utilities.toRadians(i * (15 / 4));
			let xFrom = (this.canvas.width / 2) - ((radius * 0.92) * Math.cos(currentAngle));
			let yFrom = (this.canvas.height / 2) - ((radius * 0.92) * Math.sin(currentAngle));
			let xTo = (this.canvas.width / 2) - ((radius * 0.90) * Math.cos(currentAngle));
			let yTo = (this.canvas.height / 2) - ((radius * 0.90) * Math.sin(currentAngle));
			context.moveTo(xFrom, yFrom);
			context.lineTo(xTo, yTo);
		}
		context.lineWidth = 1;
		context.strokeStyle = 'blue';
		context.stroke();
		context.closePath();

		// Hours
		context.beginPath();
		for (let i = 0; i < 24; i++) {
			let currentAngle = Utilities.toRadians(i * 15);
			let xFrom = (this.canvas.width / 2) - ((radius * 0.92) * Math.cos(currentAngle));
			let yFrom = (this.canvas.height / 2) - ((radius * 0.92) * Math.sin(currentAngle));
			let xTo = (this.canvas.width / 2) - ((radius * 0.88) * Math.cos(currentAngle));
			let yTo = (this.canvas.height / 2) - ((radius * 0.88) * Math.sin(currentAngle));
			context.moveTo(xFrom, yFrom);
			context.lineTo(xTo, yTo);
		}
		context.lineWidth = 2;
		context.strokeStyle = 'blue';
		context.stroke();
		context.closePath();

		// Hour Values
		context.beginPath();
		for (let i = 0; i < 24; i++) {
			context.save();
			context.translate(this.canvas.width / 2, (this.canvas.height / 2)); // canvas.height);
			let __currentAngle = - Utilities.toRadians(i * 15);
			context.rotate(__currentAngle - Math.PI);
			context.font = "bold " + Math.round(10) + "px Arial"; // Like "bold 15px Arial"
			context.fillStyle = 'blue';
			let hour = (this._hemisphere === NORTHERN_HEMISPHERE  || i === 0 ? i : (24 - i));
			let str = Utilities.lpad(hour.toString(), 2, '0');
			let len = context.measureText(str).width;
			context.fillText(str, -len / 2, (-(radius * .88) + 10));
			// context.lineWidth = 1;
			// context.strokeStyle = 'black';
			// context.strokeText(str, -len / 2, (-(radius * .8) + 10)); // Outlined
			context.restore();
		}
		context.closePath();

		// Visible Sky
		if (this._withVisibleSky) {
			this.drawVisibleSky(context, radius * 0.92);
		}

		// Full Sphere Celestial equator
		context.beginPath();
		context.lineWidth = 2;
		context.strokeStyle = 'gray';
		context.arc(this.canvas.width / 2, this.canvas.height / 2, radius * 0.92 / 2, 0, 2 * Math.PI, false);
		context.stroke();
		context.closePath();

		// Declinations
		context.save();
		context.beginPath();
		context.setLineDash([5]);
		context.lineWidth = 0.5;
		context.strokeStyle = 'black';
		for (let i=-80; i<90; i+=10) {
			if (i === 0) {
				continue;
			}
			context.beginPath();
			let r = Math.round((radius * 0.92 / 2) * (90 - i) / 90);
			context.arc(this.canvas.width / 2, this.canvas.height / 2, r, 0, 2 * Math.PI, false);
			context.stroke();
			context.closePath();
		}
		context.restore();

		if (this._withStars) {
			this.drawStars(context, radius * 0.92);
		}
	}

	nextMonth(month) {
		let nextMonth = Month.JANUARY;
		let bool = false;
		for (let k in Month) {
			if (bool) {
				nextMonth = Month[k];
				break;
			}
			bool = (Month[k] === month);
		}
		return nextMonth;
	}

	findCorrespondingDay(d) {
		// Day 1 is September 21st.
		let currMonth = Month.SEPTEMBER;
		let day = 21;
		let currDay = day;
		for (let i = 1; i < d; i++) {
			currDay++;
			if (currDay > currMonth.nbDays) {
				currDay = 1;
				currMonth = this.nextMonth(currMonth);
			}
		}
		return { month: currMonth, dayOfMonth: currDay};
	}

	drawVisibleSky(context, radius) {
		// White BG
		context.beginPath();
		context.fillStyle = 'white';
		for (let z=0; z<=360; z+= 0.25) {
			let deadReck = Utilities.deadReckoning({lat: this.observerLatitude, lng: 0}, 90 * 60, -z);
			let point = this.plotCoordinates(deadReck.lat, deadReck.lng, radius);
			if (z === 0) {
				context.moveTo((this.canvas.width / 2) - point.x, (this.canvas.height / 2) + point.y);
			} else {
				context.lineTo((this.canvas.width / 2) - point.x, (this.canvas.height / 2) + point.y);
			}
		}
		context.closePath();
		context.fill();
		context.closePath();

		// Skyline
		context.beginPath();
		context.strokeStyle = 'blue';
		context.lineWidth = 2;
		for (let z=0; z<=360; z+= 0.25) {
			let deadReck = Utilities.deadReckoning({lat: this.observerLatitude, lng: 0}, 90 * 60, -z);
			let point = this.plotCoordinates(deadReck.lat, deadReck.lng, radius);
			if (z === 0) {
				context.moveTo((this.canvas.width / 2) - point.x, (this.canvas.height / 2) + point.y);
			} else {
				context.lineTo((this.canvas.width / 2) - point.x, (this.canvas.height / 2) + point.y);
			}
		}
		context.closePath();
		context.stroke();
		context.closePath();

		// Zenith
		context.beginPath();
		let zenith = Math.round(((radius / 2)) * ((90 - this.observerLatitude * this._hemisphere) / 90));
		if (this._type === SKYMAP_TYPE) {
			zenith *= -1;
		}
		context.fillStyle = 'blue';
		const zenithRadius = 2;
		context.arc((this.canvas.width / 2), (this.canvas.height / 2) + zenith, zenithRadius, 0, 2 * Math.PI, false);
		context.fill();
		context.closePath();

		// Altitudes
		context.strokeStyle = 'blue';
		context.lineWidth = 0.5;
		for (let dz = 10; dz <= 90; dz += 10) {
			context.beginPath();
			for (let z = 0; z <= 360; z += 0.25) {
				let deadReck = Utilities.deadReckoning({lat: this.observerLatitude, lng: 0}, dz * 60, -z);
				let point = this.plotCoordinates(deadReck.lat, deadReck.lng, radius);
				if (z === 0) {
					context.moveTo((this.canvas.width / 2) - point.x, (this.canvas.height / 2) + point.y);
				} else {
					context.lineTo((this.canvas.width / 2) - point.x, (this.canvas.height / 2) + point.y);
				}
				if (dz === 90 && z % 90 === 0) { // Cardinal points
					context.save();
					context.font = "bold 12px Arial"; // Like "bold 15px Arial"
					context.fillStyle = 'red';
					let str = "";
					let len = 0;
					switch (z) {
						case 0:
							str = (this._hemisphere === NORTHERN_HEMISPHERE ? "N" : "S");
							len = context.measureText(str).width;
							context.fillText(str, (this.canvas.width / 2) - point.x - (len / 2), (this.canvas.height / 2) + point.y + (this._type === STARFINDER_TYPE ? -2 : 12));
							break;
						case 90:
							str = "E";
							len = context.measureText(str).width;
							context.fillText(str, (this.canvas.width / 2) - point.x - (len / 2) + (this._hemisphere === NORTHERN_HEMISPHERE ? 8 : -12), (this.canvas.height / 2) + point.y + 6);
							break;
						case 180:
							str = (this._hemisphere === NORTHERN_HEMISPHERE ? "S" : "N");
							len = context.measureText(str).width;
							context.fillText(str, (this.canvas.width / 2) - point.x - (len / 2), (this.canvas.height / 2) + point.y + (this._type === STARFINDER_TYPE ? 12 : -2));
							break;
						case 270:
							str = "W";
							len = context.measureText(str).width;
							context.fillText(str, (this.canvas.width / 2) - point.x - (len / 2) + (this._hemisphere === NORTHERN_HEMISPHERE ? -12 : 8), (this.canvas.height / 2) + point.y + 6);
							break;
						default:
							break;
					}
					context.restore();
				}
			}
			context.closePath();
			context.stroke();
		}

		// Azimuths in visible sky
		for (let z=0; z<360; z+=5) {
			if (z % 90 === 0) {
				context.lineWidth = 2;
			} else {
				context.lineWidth = 0.5;
			}
			context.beginPath();
			for (let dz=10; dz<=90; dz++) {
				let deadReck = Utilities.deadReckoning({lat: this.observerLatitude, lng: 0}, dz * 60, z);
				let point = this.plotCoordinates(deadReck.lat, deadReck.lng, radius);
				if (dz === 10) {
					context.moveTo((this.canvas.width / 2) - point.x, (this.canvas.height / 2) + point.y);
				} else {
					context.lineTo((this.canvas.width / 2) - point.x, (this.canvas.height / 2) + point.y);
				}
			}
			context.stroke();
			context.closePath();
		}
	}

	plotBody(context, name, decl, ra) { // TODO Image for wandering bodies
		let lng = ra;
		lng += this.LHAAries;
		if (lng > 180) {
			lng -= 360;
		}
		let D = decl * this._hemisphere;
	}

	findStar(starArray, starName) {
		let star = {};
		for (let i=0; i<starArray.length; i++) {
			if (starArray[i].name === starName) {
				return starArray[i];
			}
		}
		return star;
	}

	drawStars(context, radius) {
		for (let i=0; i<constellations.length; i++) {
			// Constellation?
			if (this._withConstellations) {
				let constellation = constellations[i].lines;
				for (let l = 0; l < constellations[i].lines.length; l++) {
					let starFrom = this.findStar(constellations[i].stars, constellations[i].lines[l].from);
					let starTo = this.findStar(constellations[i].stars, constellations[i].lines[l].to);
					if (starFrom !== {} && starTo !== {}) {
						context.beginPath();
						let dec = starFrom.d * this._hemisphere;
						let ra = starFrom.ra;
						let lng = (360 - (ra * 360 / 24));
						lng -= (this._hemisphere * this.LHAAries);
						if (lng > 180) {
							lng -= 360;
						}
						let p1 = this.plotCoordinates(dec, lng, radius);
						dec = starTo.d * this._hemisphere;
						ra = starTo.ra;
						lng = (360 - (ra * 360 / 24));
						lng -= (this._hemisphere * this.LHAAries);
						if (lng > 180) {
							lng -= 360;
						}
						let p2 = this.plotCoordinates(dec, lng, radius);
						context.strokeStyle = 'black';
						context.lineWidth = 0.5;

						context.moveTo((this.canvas.width / 2) - ((this._type === STARFINDER_TYPE ? 1 : -1 ) * p1.x), (this.canvas.height / 2) + p1.y);
						context.lineTo((this.canvas.width / 2) - ((this._type === STARFINDER_TYPE ? 1 : -1 ) * p2.x), (this.canvas.height / 2) + p2.y);

						context.stroke();
						context.closePath();
					}
				}
				if (this._constellationNames) {
					// TODO
				}
			}

			// Stars
			for (let s=0; s<constellations[i].stars.length; s++) {
				let dec = constellations[i].stars[s].d * this._hemisphere;
				let ra = constellations[i].stars[s].ra;
				let lng = (360 - (ra * 360 / 24));
				lng -= (this._hemisphere * this.LHAAries);
				if (lng > 180) {
					lng -= 360;
				}
				let p = this.plotCoordinates(dec, lng, radius);
				context.beginPath();
				context.fillStyle = 'gold';
				const starRadius = 2;
				context.arc((this.canvas.width / 2) - ((this._type === STARFINDER_TYPE ? 1 : -1 ) * p.x), (this.canvas.height / 2) + p.y, starRadius, 0, 2 * Math.PI, false);
				context.fill();
				context.strokeStyle = 'black';
				context.lineWidth = 0.5;
				context.stroke();

				if (s === 0 && this._starNames) { // Star name
					context.font = "bold " + Math.round(10) + "px Arial"; // Like "bold 15px Arial"
					context.fillStyle = 'blue';
					let str = constellations[i].stars[s].name;
					let len = context.measureText(str).width;
					context.fillText(str, (this.canvas.width / 2) - ((this._type === STARFINDER_TYPE ? 1 : -1 ) * p.x) - (len / 2), (this.canvas.height / 2) + p.y - 2);
				}
				context.closePath();
			}
		}
	}

	plotCoordinates(lat, lng, radius) {
		let r = (((90 - lat) / 180) * radius);
		let xOffset = Math.round(r * Math.sin(Utilities.toRadians(lng))) * this._hemisphere;
		let yOffset = Math.round(r * Math.cos(Utilities.toRadians(lng)));
		if (this._type === SKYMAP_TYPE) {
			yOffset *= -1;
	//	xOffset *= -1;
		}
		return {x: xOffset, y: yOffset};
	}
}

// Associate the tag and the class
window.customElements.define(SKY_MAP_TAG_NAME, SkyMap);
