function S (canvas, context)
{
	function Coord (x, y)
	{
		return { x : x, y : y };
	}

	function Add (a, b)
	{
		if (a && b) {
			a.x += b.x;
			a.y += b.y;
		}
	}
	
	function CalculateDistance (a, b)
	{
		var aDiff = a.x - b.x, bDiff = a.y - b.y;
		distance = Math.sqrt (aDiff * aDiff + bDiff * bDiff);
	}

	function Planet (xPosition, yPosition, radius, motion, mass, color)
	{
		return {
			x : xPosition, // x position of the planet
			y : yPosition, // y position of the planet
			r : radius, // radius of the planet
			m : motion, // self motion of the planet
			s : mass || radius / 5, // mass of the planet for gravity calculation
			c : color || '#08b', // color of the planet
			l : 1 // is the planet still alive
		}
	}
	
	function UpdateMouseCoordinates (ev)
	{
		mouseX = ev.pageX;
		mouseY = ev.pageY;
	}
	
	var width = canvas.width,
		height = canvas.height,
		planets = [
			Planet (width / 2, height / 2, 20, 0, 200, '#fc3'),
			Planet (width / 2, height / 2 + 200, 8, Coord (1, 0))
		],
		edited, mouseX, mouseY, distance;
		
	canvas.onclick = function (ev) {
		UpdateMouseCoordinates (ev);
		if (edited) {
			edited.m = Coord ((mouseX - edited.x) / 99, (mouseY - edited.y) / 99);
			planets.push (edited);
			edited = 0;
		} else {
			edited = Planet (mouseX, mouseY, Math.random () * 5 + 5);
		}
	}
	
	canvas.onmousemove = UpdateMouseCoordinates;

	setInterval (function () {
		var n = planets.length, i, j, aPlanet, bPlanet,
		speed, survivedPlanets, absorber, absorbed;
		
		// calculate the new motion vector for all planets
		for (i = n; i--;) {
			aPlanet = planets[i];
			// add gravitational movement
			for (j = n; j--;) {
				if (i - j) { // i != j
					bPlanet = planets[j];
					CalculateDistance (bPlanet, aPlanet);
					speed = (aPlanet.s * bPlanet.s) / (distance * distance);
					Add (aPlanet.m, Coord ((bPlanet.x - aPlanet.x) / distance * speed, (bPlanet.y - aPlanet.y) / distance * speed));
				}
			}
		}
		
		// move all planets with the calculated motion
		for (i = n; i--;) {
			Add (planets[i], planets[i].m);
		}
		
		// handle planet collisions and delete absorbed planets
		survivedPlanets = [];
		for (i = n; i--;) {
			aPlanet = planets[i];
			for (j = n; j-- > i + 1;) {
				bPlanet = planets[j];
				// absorb happens when the planets are too close to each other
				CalculateDistance (bPlanet, aPlanet);
				if (aPlanet.l && bPlanet.l && distance < aPlanet.r + bPlanet.r) {
					// the absorved planet is the one with smaller mass
					absorbed = (aPlanet.s < bPlanet.s ? aPlanet : bPlanet);
					absorber = (absorbed == aPlanet ? bPlanet : aPlanet);
					// increase the absorber planets radius and mass
					absorber.r += absorbed.r / 2;
					absorber.s += absorbed.s / 2;
					// the new motion is the average of the two original motions
					Add (absorber.m, absorbed.m);
					if (absorber.m) {
						absorber.m.x /= 2;
						absorber.m.y /= 2;
					}
					// the absorbed planet is now dead
					absorbed.l = 0;
				}
			}
			if (aPlanet.l) {
				survivedPlanets.push (aPlanet);
			}
		}
		planets = survivedPlanets;

		// now draw all the planets
		context.fillStyle = '#222';
		context.fillRect (0, 0, width, height);
		// index is out of range in case of deleted planets, but it works,
		// although the edited planet sometimes drawn twice
		for (i = n + 1; i--;) {
			aPlanet = planets[i] || edited;
			if (aPlanet) {
				context.beginPath ();
				context.fillStyle = aPlanet.c;
				context.arc (aPlanet.x, aPlanet.y, aPlanet.r, 0, 7 /* 2 * Math.PI :) */);
				context.fill ();
				if (aPlanet == edited) {
					context.strokeStyle = aPlanet.c;
					context.moveTo (aPlanet.x, aPlanet.y);
					context.lineTo (mouseX, mouseY);
					context.stroke ();
				}
			}
		}		
	}, 10);
}
S (a, c);
