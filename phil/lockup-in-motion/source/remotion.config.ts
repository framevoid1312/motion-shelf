import {Config} from '@remotion/cli/config';

// High quality encode so the grain/halftone survives compression.
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCrf(14);
Config.setOverwriteOutput(true);
