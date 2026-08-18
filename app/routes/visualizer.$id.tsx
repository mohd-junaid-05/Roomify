import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router";
import { useEffect, useRef, useState } from "react";
import { generate3DView } from "../../lib/ai.action";
import { Box, Download, RefreshCcw, Share2, UserPen, X } from "lucide-react";
import Button from "~/components/ui/button";
import { createProject, getProjectById } from "../../lib/puter.action";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";

const VisualizerId = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const { userId } = useOutletContext<AuthContext>();

  const hasInitialGenerated = useRef(false);

  const [project, setProject] = useState<DesignItem | null>(null);
  const [isProjectLoading, setIsProjectLoading] = useState(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(
    project?.renderedImage || null,
  );

  const handleBack = () => navigate("/");

  const handleExport = async () => {
    if (!currentImage) return;

    try {
      let blob: Blob;

      if (currentImage.startsWith("data:")) {
        // data URL — convert directly to blob
        const res = await fetch(currentImage);
        blob = await res.blob();
      } else {
        // Remote URL — fetch with CORS
        const res = await fetch(currentImage);
        blob = await res.blob();
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roomify-render-${id ?? Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    }
  };

  const runGeneration = async (item: DesignItem) => {
    if (!id || !item.sourceImage) return;

    try {
      setIsProcessing(true);
      const result = await generate3DView({ sourceImage: item.sourceImage });

      if (result.renderedImage) {
        setCurrentImage(result.renderedImage);

        const updatedItem = {
          ...item,
          renderedImage: result.renderedImage,
          renderedPath: result.renderedPath,
          timestamp: Date.now(),
          ownerId: item.ownerId ?? userId ?? null,
          isPublic: item.isPublic ?? false,
        };

        const saved = await createProject({
          item: updatedItem,
          visibility: "private",
        });

        if (saved) {
          setProject(saved);
          setCurrentImage(saved.renderedImage || result.renderedImage);
        }
      }
    } catch (error) {
      console.log("Generation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let isMounted = true;

    const loadProject = async () => {
      if (!id) {
        setIsProjectLoading(false);
        return;
      }

      setIsProjectLoading(true);

      const fetchedProject = await getProjectById({ id });

      if (!isMounted) return;

      setProject(fetchedProject);
      setCurrentImage(fetchedProject?.renderedImage || null);
      setIsProjectLoading(false);
      hasInitialGenerated.current = false;
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (
      isProjectLoading ||
      hasInitialGenerated.current ||
      !project?.sourceImage
    )
      return;

    if (project.renderedImage) {
      setCurrentImage(project.renderedImage);
      hasInitialGenerated.current = true;
      return;
    }

    hasInitialGenerated.current = true;
    void runGeneration(project);
  }, [project, isProjectLoading]);

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
                <h2>{project?.name || `Residence ${id}`}</h2>
                <p className="note">Created by You </p>
              </div>
              <div className="panel-actions">
                <Button
                  size="sm"
                  onClick={handleExport}
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
            <div
              className={`render-area ${isProcessing ? "is-processing" : ""}`}
            >
              {currentImage ? (
                <img
                  src={currentImage}
                  alt="AI render"
                  className="render-img"
                />
              ) : (
                <div className="render-placeholder">
                  {project?.sourceImage && (
                    <img
                      src={project.sourceImage}
                      alt="Original"
                      className="render-fallback"
                    />
                  )}
                </div>
              )}

              {isProcessing && (
                <div className="render-overlay">
                  <div className="rendering-card">
                    <RefreshCcw className="spinner" />
                    <span className="title">Rendering...</span>
                    <span className="subtitle">
                      Please wait for the image to render. It may take a few
                      seconds.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="panel compare">
            <div className="panel-header">
              <div className="panel-meta">
                <p>Comparison</p>
                <h2>Before After</h2>
              </div>
              <div className="hint">Drag to compare</div>
            </div>

            <div className="compare-stage">
              {project?.sourceImage && currentImage ? (
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={project.sourceImage} alt="Before" className="compare-image" />}
                  itemTwo={<ReactCompareSliderImage src={currentImage} alt="After" className="compare-image" />}
                  style={{width:'100%',height:'100%',position:'relative',borderRadius:'16px'  }}
                />
              ) : (
                <div className="compare-fallback">
                 {project?.sourceImage && (
                  <img src={project.sourceImage} alt="before" className="compare-img"/>
                 )}
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
