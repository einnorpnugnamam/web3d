// three js initialization

var three = {
	init: function() {
		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

		const renderer = new THREE.WebGLRenderer();

		renderer.setClearColor("#e5e5e5");
		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild( renderer.domElement );

		var controls = new THREE.OrbitControls( camera, renderer.domElement  );
		

		camera.position.set(0, 10, 20);

		three.gltfLoader(scene, camera, controls);

		const animate = function () {
			if (three.resizeRendererToDisplaySize(renderer)) {
				console.log("foo");
				const canvas = renderer.domElement;
				camera.aspect = canvas.clientWidth / canvas.clientHeight;
				camera.updateProjectionMatrix();
		    }

			renderer.render( scene, camera );


		    requestAnimationFrame( animate );

		    // zooming and rotating
			controls.update();
		};

		animate();

		three.activateEventHandler(renderer, camera);
	},

	activateEventHandler: function(renderer, camera) {
		window.addEventListener('resize', function() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;

			camera.updateProjectionMatrix();
		});
	},

	resizeRendererToDisplaySize: function(renderer) {
	    const canvas = renderer.domElement;
	    const width = canvas.clientWidth;
	    const height = canvas.clientHeight;
	    const needResize = canvas.width !== width || canvas.height !== height;
	    if (needResize) {
	      renderer.setSize(width, height, false);
	    }
	    return needResize;
	},

	gltfLoader: function(scene, camera, controls) {

	    const shoulderColor = 0x999999;
	    const groundColor = 0xFFFFFF;
	    const intensity = 1;
	    var light = new THREE.HemisphereLight(shoulderColor, groundColor, intensity);
	    scene.add(light);

	    const color = 0xFFFFFF;
	    light = new THREE.DirectionalLight(color, intensity);
	    light.position.set(5, 10, 2);
	    scene.add(light);
	    scene.add(light.target);

		const loader = new THREE.GLTFLoader();

		// Optional: Provide a DRACOLoader instance to decode compressed mesh data
		const dracoLoader = new THREE.DRACOLoader();
		dracoLoader.setDecoderPath( '/img/' );
		loader.setDRACOLoader( dracoLoader );
    
		// Load a glTF resource
		loader.load(
			// resource URL
			'./theme/img/scene.gltf',
			// called when the resource is loaded
			function ( gltf ) {
				console.log(gltf.parser);
				scene.add(gltf.scene);

				const box = new THREE.Box3().setFromObject(gltf.scene);

				const boxSize = box.getSize(new THREE.Vector3()).length();
				const boxCenter = box.getCenter(new THREE.Vector3());

				// set the camera to frame the box
				three.frameArea(boxSize * 0.5, boxSize, boxCenter, camera);

				// update the Trackball controls to handle the new size
				controls.maxDistance = boxSize * 10;
				controls.target.copy(boxCenter);;
			},
			// called while loading is progressing
			function ( xhr ) {

				// console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

			},
			// called when loading has errors
			function ( error ) {

				console.log( 'An error happened' );

			}
		);
	},

	frameArea: function(sizeToFitOnScreen, boxSize, boxCenter, camera) {
	    const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
	    const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
	    const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
	    // compute a unit vector that points in the direction the camera is now
	    // in the xz plane from the center of the box
	    const direction = (new THREE.Vector3())
	        .subVectors(camera.position, boxCenter)
	        .multiply(new THREE.Vector3(0, 4, -2))
	        .normalize();

	    // move the camera to a position distance units way from the center
	    // in whatever direction the camera was from the center already
	    camera.position.copy(direction.multiplyScalar(distance * 2.5).add(boxCenter));

	    // pick some near and far values for the frustum that
	    // will contain the box.
	    camera.near = boxSize / 100;
	    camera.far = boxSize * 100;

	    camera.updateProjectionMatrix();

	    // point the camera to look at the center of the box
	    camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
	  }
};