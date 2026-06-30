class MainActivity : AppCompatActivity() {

    private lateinit var arSceneView: ArSceneView
    private var modelNode: ModelNode? = null
    private var isModelLoaded = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Full immersive
        window.setFlags(FLAG_FULLSCREEN, FLAG_FULLSCREEN)
        setContentView(R.layout.activity_main)

        arSceneView = findViewById(R.id.arSceneView)

        // Setup augmented image database
        arSceneView.onArSessionCreated = { session ->
            val config = session.config
            config.augmentedImageDatabase = buildImageDatabase(session)
            session.configure(config)
        }

        // On image detected
        arSceneView.onAugmentedImageUpdate = { augmentedImage ->
            if (augmentedImage.name == "candi_jago" &&
                augmentedImage.trackingState == TrackingState.TRACKING &&
                !isModelLoaded) {
                loadGlbModel(augmentedImage)
            }
        }
        
    }

    private fun buildImageDatabase(session: Session): AugmentedImageDatabase {
        val db = AugmentedImageDatabase(session)
        val bitmap = BitmapFactory.decodeStream(assets.open("candi_jago_marker.jpg"))
        db.addImage("candi_jago", bitmap, 0.1f)
        return db
    }

    private fun loadGlbModel(image: AugmentedImage) {
        isModelLoaded = true
        val glbUrl = "https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/candijago1.glb"
        
        ModelLoader(this).loadFromUrl(glbUrl) { modelRenderable ->
            val anchor = image.createAnchor(image.centerPose)
            modelNode = ModelNode().apply {
                setRenderable(modelRenderable)
                parent = arSceneView.scene
                anchor(anchor)
            }
        }
    }
}
