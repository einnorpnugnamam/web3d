// three js initialization

var three = {
	init: function() {
		var scene = new THREE.Scene();

		const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		
		const renderer = new THREE.WebGLRenderer({ antialias: true });

		renderer.setSize( window.innerWidth, window.innerHeight );
		document.body.appendChild(renderer.domElement);

		window.addEventListener('resize', function() {
			renderer.setSize(window.innerWidth, window.innerHeight);
			camera.aspect = window.innerWidth / window.innerHeight;

			camera.updateProjectionMatrix();
		});
	}
};