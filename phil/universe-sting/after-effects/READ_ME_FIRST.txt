UNIVERSE 89 -> 26 - After Effects builder (needs After Effects 24.1+, Advanced 3D)

1. Install both fonts in fonts/ (FVGroteskCondensed-Black = word, FVMonaYear-Regular = year digits), restart AE.
2. File > Scripts > Run Script File... > Universe_sting_clone.jsx
   Keep this folder together: the script links the GLB models in models/ by relative path.
   If AE shows a Model Settings dialog for a model, keep the defaults and press OK.
3. The script builds OBJECTS_3D (live 3D model layers, keyed every frame), a grain layer, the ring,
   the lockup with the year odometer, and saves Universe_sting_clone.aep next to the script.

Not included: the Copilot and duck models (third-party assets) and the reference video. The script skips
anything missing and lists it when it finishes.

If the models come in too big or small, adjust MODEL RIG > "Model unit fix %" in OBJECTS_3D.
