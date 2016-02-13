function R (context)
{
	function Vector (x, y, z)
	{
		// w component is for rgba usage
		return {x : x, y : y, z : z, w : 1};
	}

	function Mul (a, b)
	{
		return Vector (a.x * b, a.y * b, a.z * b);
	}

	function Add (a, b)
	{
		return Sub (a, Mul (b, -1));
	}
	
	function Sub (a, b)
	{
		return Vector (a.x - b.x, a.y - b.y, a.z - b.z);
	}

	function Dot (a, b)
	{
		return a.x * b.x + a.y * b.y + a.z * b.z;
	}

	function Normalize (a)
	{
		return Mul (a, 1 / mySqrt (a.x * a.x + a.y * a.y + a.z * a.z));
	}
	
	function RayModelIntersection (rayOrigin, rayDirection)
	{
		var sphereIndex = 9,
		currentIndex, result, sphereRadius,
		sphereToRay, a, b, minT;

		// check intersection with every sphere in the scene
		while (sphereIndex--) {
			// check ray-sphere intersection
			currentIndex = 3 * sphereIndex;
			sphereRadius = geometry[currentIndex + 1];
			sphereToRay = Sub (rayOrigin, geometry[currentIndex]);
			a = Dot (rayDirection, rayDirection) / 2;
			b = -2 * Dot (sphereToRay, rayDirection);
			minT = (b - mySqrt (b * b - 8 * a * (Dot (sphereToRay, sphereToRay) - sphereRadius * sphereRadius))) * a;
			// in case of negative discriminant minT is NaN, and it is not greater than 0.1 :)
			if (minT > 0.1 && (!result || minT < result.d)) {
				result = {i : currentIndex, d : minT};
			}
		}
		return result;
	}

	function RenderRowsOneStep ()
	{
		var sampleCount = 32,
		imageData = context.createImageData (canvasSize, 1),
		imageDataIndex = 0,
		columnIndex = canvasSize,
		componentIndex, tracedColor, currentSample,
		rayDirection, intersection, shadedColor, intersectionPoint;
		while (columnIndex--) {
			tracedColor = blackColor;
			currentSample = sampleCount;
			// shoot random rays through the pixel
			while (currentSample--) {
				rayDirection = Normalize (
					Sub (
						Vector (0, halfCanvasSize - columnIndex + myRandom (), halfCanvasSize - rowIndex + myRandom ()),
						eyePosition
					)
				);
				intersection = RayModelIntersection (eyePosition, rayDirection);
				shadedColor = backgroundColor;
				if (intersection) {
					intersectionPoint = Add (eyePosition, Mul (rayDirection, intersection.d));
					// do the shading for intersection point (no shading for the large sphere)
					shadedColor = RayModelIntersection (intersectionPoint, Normalize (Sub (lightPosition, intersectionPoint))) ?
						blackColor : // in shadow
						intersection.i ? // not the first large sphere
							Mul (
								geometry[intersection.i + 2], // sphere color
								M.max (
									Dot (
										Normalize (Sub (lightPosition, intersectionPoint)), // direction to the light source
										Normalize (Sub (intersectionPoint, geometry[intersection.i])) // sphere normal vector
									),
									0.0
								) // diffuse intensity
							) :
							backgroundColor; // first large sphere
				}
				tracedColor = Add (tracedColor, Mul (shadedColor, 1 / sampleCount));
			}
			for (componentIndex in tracedColor) {
				imageData.data[imageDataIndex++] = tracedColor[componentIndex] * 255;
			}
		}
		context.putImageData (imageData, 0, rowIndex);
		if (rowIndex++ < canvasSize) {
			setTimeout (RenderRowsOneStep, 0);
		}
	}
	
	function Random (from, to)
	{
		return myRandom () * (to - from) + from;
	}

	var M = Math,
	mySqrt = M.sqrt,
	myRandom = M.random,
	canvasSize = 512,
	halfCanvasSize = canvasSize / 2,
	eyePosition = Vector (canvasSize, 0, 0),
	lightPosition = Vector (canvasSize, Random (-canvasSize, canvasSize), canvasSize),
	backgroundColor = Vector (0.8, 0.8, 0.8),
	groundSphereRadius = 1000000,
	groundOffset = 75,
	blackColor = Vector (0, 0, 0),
	geometry = [
		Vector (0, 0, -groundSphereRadius - groundOffset), groundSphereRadius, backgroundColor
	],
	rowIndex = 1,
	randomSphereCount = 8,
	radius;
	
	while (randomSphereCount--) {
		radius = Random (20, 60);
		geometry.push (Vector (Random (-canvasSize, halfCanvasSize), Random (-halfCanvasSize, halfCanvasSize), radius - groundOffset), radius, Vector (myRandom (), myRandom (), myRandom ()));
	}

	RenderRowsOneStep ();
}

R (c);
