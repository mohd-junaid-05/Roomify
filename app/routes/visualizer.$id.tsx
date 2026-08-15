import { useLocation, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { generate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share2, X } from "lucide-react";
import Button from "~/components/ui/button";

const VisualizerId = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initialImage, initialRender, name } = location.state || {};

  const hasInitialGenerated = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    initialRender || null,
  );

  const handleBack = () => navigate("/");

  const runFeneration = async () => {
    if (!initialImage) return;

    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: initialImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);
        //update the project with the render image
      }
    } catch (error) {
      console.log("Generation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!initialImage || hasInitialGenerated.current) return;

    hasInitialGenerated.current = true;

    if (initialRender) {
      setCurrentImage(initialRender);
    }

    // Always run generation — whether it's a new project or a re-render
    runFeneration();
  }, [initialImage, initialRender]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section>
      <div className="visualizer">
        <nav className="topbar">
          <div>
            <Box className="logo" />
            <span className="name">Roomify</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="exit"
          >
            <X className="icon" /> Exit Editor
          </Button>
        </nav>
        <section className="content">
          <div className="panel">
            <div className="panel-header">
              <div className="panel-meta">
                <p>Project</p>
                <h2>{"Untitled Project"}</h2>
                <p className="note">Created by You </p>
              </div>
              <div className="panel-actions">
                <Button
                  size="sm"
                  onClick={() => {}}
                  className="export"
                  disabled={!currentImage}
                >
                  <Download className="w-4 h-4 mr-2" /> Export
                </Button>
                <Button
                  size="sm"
                  onClick={() => {}}
                  className="share"
                  disabled={!currentImage}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
              </div>
            </div>
            <div className={`render-area ${isProcessing ? 'is-processing': ''}`}>
                {currentImage ? (
                    <img src={currentImage} alt="AI render" className="render-img"/>

                ) : (
                    <div className="render-placeholder">
                        {
                            initialImage && (
                                <img src={initialImage} alt="Original"
                                className="render-fallback" />
                            )
                        }
                    </div>
                )}

                {isProcessing && (
                    <div className="render-overlay">
                        <div className="rendering-card">
                            <RefreshCcw className="spinner" />
                            <span className="title">Rendering...</span>
                            <span className="subtitle">Please wait for the image to render. It may take a few seconds.</span>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};
export default VisualizerId;
