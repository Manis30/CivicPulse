import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  MapPin,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertTriangle,
  TreePine,
  Trash2,
  Lightbulb,
  Droplets,
  Construction,
  Sparkles,
  Bot,
  Radio,
  Navigation,
  Loader2,
  X,
  RefreshCw,
  Eye,
  Check,
  Building2,
  ShieldCheck,
  Clock,
  Cpu
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FormField, Input, Textarea, Select } from '@/components/ui/Input';
import { reportService, SubmitReportPayload } from '@/services/reportService';
import { evidenceService, getEvidenceImageUrl, EvidenceRecord } from '@/services/evidenceService';
import { formatApiError } from '@/services/apiClient';
import { authService } from '@/services/authService';
import { incidentService, normalizeCategory, getCategoryDisplayLabel } from '@/services/incidentService';
import { useIncidents } from '@/contexts/IncidentContext';
import {
  CitizenContentContainer,
  CitizenPageHeader,
  CitizenCard,
} from '@/components/citizen/CitizenContentContainer';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LuConstruction,
  LuTreePine,
  LuLightbulb,
  LuTrash2,
  LuDroplets,
  LuTriangleAlert,
  LuRadio,
  LuFileText,
  LuArrowRight,
  LuCheck,
  LuSparkles,
  LuCopy,
  LuEye,
  LuMapPin,
  LuActivity,
  LuSend,
  LuBot,
  LuCalendar,
  LuClock,
  LuPlus,
  LuBuilding2,
} from 'react-icons/lu';
import { toast } from 'react-toastify';
import { ReportTopNav } from '@/components/citizen/report/ReportTopNav';
import { ReportProcessRail } from '@/components/citizen/report/ReportProcessRail';
import { CategoryTile, CategoryDefinition } from '@/components/citizen/report/CategoryTile';
import { CivicIntakeVisualization, IntakeStage } from '@/components/citizen/report/CivicIntakeVisualization';
import { ReportDossierCompact } from '@/components/citizen/report/ReportDossierCompact';
import { SignalTravelOverlay } from '@/components/citizen/report/SignalTravelOverlay';
import { CivicCityscapeBackground } from '@/components/citizen/report/CivicCityscapeBackground';

const CATEGORIES: CategoryDefinition[] = [
  {
    id: 'POTHOLE',
    label: 'Pothole & Road Damage',
    icon: <LuConstruction className="w-5 h-5" />,
    description: 'Cracks, asphalt craters, surface subsidence',
    department: 'Department of Transport & Roads',
    accentBg: 'bg-[#EBF3FD] border-[#2878E5]/20',
    iconColor: '#2878E5',
  },
  {
    id: 'FALLEN_TREE',
    label: 'Fallen Tree / Hazard',
    icon: <LuTreePine className="w-5 h-5" />,
    description: 'Blocked roadways, hazardous branches on power lines',
    department: 'Parks & Environment',
    accentBg: 'bg-[#E7F7F0] border-[#159A68]/20',
    iconColor: '#159A68',
  },
  {
    id: 'STREETLIGHT',
    label: 'Streetlight Out',
    icon: <LuLightbulb className="w-5 h-5" />,
    description: 'Dark crosswalk, flickering pole, electrical hazard',
    department: 'Energy & Electrical',
    accentBg: 'bg-[#FEF8EC] border-[#F2B84B]/30',
    iconColor: '#F2B84B',
  },
  {
    id: 'GARBAGE',
    label: 'Overflowing Garbage',
    icon: <LuTrash2 className="w-5 h-5" />,
    description: 'Uncollected municipal refuse, illegal dumping, bin overflow',
    department: 'Solid Waste Management',
    accentBg: 'bg-[#FDF2F2] border-[#EF6A63]/30',
    iconColor: '#EF6A63',
  },
  {
    id: 'WATER_LEAK',
    label: 'Water Pipe Leak',
    icon: <LuDroplets className="w-5 h-5" />,
    description: 'Gushing main line, low pressure, sidewalk flooding',
    department: 'Water Supply & Sewerage Board',
    accentBg: 'bg-[#E0F7FA] border-[#00A3BF]/30',
    iconColor: '#00A3BF',
  },
  {
    id: 'DRAINAGE',
    label: 'Clogged Drainage',
    icon: <LuTriangleAlert className="w-5 h-5" />,
    description: 'Storm drain blockage, stagnant water, overflow risk',
    department: 'Stormwater Management',
    accentBg: 'bg-[#FFF3E0] border-[#E67E22]/30',
    iconColor: '#E67E22',
  },
  {
    id: 'TRAFFIC_SIGNAL',
    label: 'Traffic Signal Failure',
    icon: <LuRadio className="w-5 h-5" />,
    description: 'Dead light, malfunctioning intersection sequence',
    department: 'Traffic & Transport',
    accentBg: 'bg-[#FEE2E2] border-[#E02424]/30',
    iconColor: '#E02424',
  },
  {
    id: 'OTHER',
    label: 'Other Civic Defect',
    icon: <LuFileText className="w-5 h-5" />,
    description: 'Public infrastructure, damaged bench, signage defect',
    department: 'General Public Works',
    accentBg: 'bg-[#EEF2FF] border-[#6366F1]/30',
    iconColor: '#6366F1',
  },
];

const WARDS_LIST = [
  'Ward 12 - Central Hosur',
  'Ward 08 - Bagalur Road Corridor',
  'Ward 05 - SIPCOT Industrial Complex',
  'Ward 03 - Mookandapalli',
  'Ward 01 - Mathigiri',
];

export function ReportIssuePage() {
  const [step, setStep] = useState(1);
  
  // Unified single Report Draft state
  const [category, setCategory] = useState('POTHOLE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedEvidence, setUploadedEvidence] = useState<EvidenceRecord | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Location telemetry (Default Central Hosur)
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number }>({
    lat: 12.7375,
    lng: 77.8285,
    accuracy: 12,
  });
  const [gpsLocked, setGpsLocked] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [address, setAddress] = useState('MG Road, Near Central Bus Terminus');
  const [ward, setWard] = useState('Ward 12 - Central Hosur');
  const [description, setDescription] = useState(
    'Large pothole in the right lane directly opposite the bus stop. Multiple vehicles swerving into oncoming traffic to avoid rim damage.'
  );

  // Submission & Post-submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<{
    title: string;
    message: string;
    statusCode?: number;
  } | null>(null);
  const [createdIncident, setCreatedIncident] = useState<any>(null);
  const [isCopiedId, setIsCopiedId] = useState<boolean>(false);

  // Cinematic Intake Animation Sequence State
  const [intakeStage, setIntakeStage] = useState<IntakeStage>('READY');
  const [originCardRect, setOriginCardRect] = useState<DOMRect | null>(null);
  const [targetIntakeRect, setTargetIntakeRect] = useState<DOMRect | null>(null);
  const intakeContainerRef = useRef<HTMLDivElement | null>(null);
  const [isTransitioningStep, setIsTransitioningStep] = useState(false);
  const sequenceTimersRef = useRef<NodeJS.Timeout[]>([]);

  // Choreographed Cinematic Selection Sequence (~1.8–2.2s total)
  const handleSelectCategory = (catId: string, originRect?: DOMRect) => {
    sequenceTimersRef.current.forEach(clearTimeout);
    sequenceTimersRef.current = [];

    setCategory(catId);

    if (originRect && intakeContainerRef.current) {
      setOriginCardRect(originRect);
      setTargetIntakeRect(intakeContainerRef.current.getBoundingClientRect());
    }

    // 0ms: Signal begins traveling from card
    setIntakeStage('SIGNAL_RECEIVED');

    // 450ms: Signal arrives at Central Node -> Vision activates
    const t1 = setTimeout(() => setIntakeStage('VISION_ACTIVE'), 450);
    // 900ms: Location agent activates
    const t2 = setTimeout(() => setIntakeStage('LOCATION_ACTIVE'), 900);
    // 1300ms: Severity agent activates
    const t3 = setTimeout(() => setIntakeStage('SEVERITY_ACTIVE'), 1300);
    // 1600ms: Routing agent activates
    const t4 = setTimeout(() => setIntakeStage('ROUTING_ACTIVE'), 1600);
    // 1950ms: All agents complete -> Ready for evidence
    const t5 = setTimeout(() => setIntakeStage('READY'), 1950);

    sequenceTimersRef.current = [t1, t2, t3, t4, t5];
  };

  // Cinematic page transition to Step 2
  const handleContinueToEvidence = () => {
    setIsTransitioningStep(true);
    setTimeout(() => {
      setStep(2);
      setIsTransitioningStep(false);
    }, 380);
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const { refreshIncidents } = useIncidents();
  const navigate = useNavigate();

  const selectedCategoryObj = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];

  // Geolocation lookup
  const requestLocation = () => {
    if (!navigator.geolocation) {
      setSubmissionError({
        title: 'Geolocation Unsupported',
        message: 'Browser geolocation is not supported on this device. You can enter the location manually.',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
          accuracy: Math.round(pos.coords.accuracy),
        });
        setGpsLocked(true);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation lookup notice:', err.message);
        setIsLocating(false);
        // Retain default Hosur coordinates for smooth testing
        setGpsLocked(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    // Attempt auto-location capture on mount
    requestLocation();
  }, []);

  // Perform persistent evidence upload immediately upon file selection
  const performUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadError(null);
      const evidence = await evidenceService.uploadEvidence(file, {
        type: 'BEFORE',
        latitude: coords.lat,
        longitude: coords.lng,
      });
      setUploadedEvidence(evidence);
      const persistentUrl = getEvidenceImageUrl(evidence.fileUrl);
      if (persistentUrl) {
        setPreviewUrl(persistentUrl);
      }
    } catch (err: any) {
      console.error('[ReportIssuePage] Evidence upload failed:', err);
      setUploadError(err.message || 'Unable to upload image. Please try again.');
      setUploadedEvidence(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle image selection
  const handleSelectFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setSubmissionError({
        title: 'Invalid File Type',
        message: 'Please upload an image file (JPEG, PNG, or WebP).',
      });
      return;
    }
    // Max 15MB
    if (file.size > 15 * 1024 * 1024) {
      setSubmissionError({
        title: 'File Too Large',
        message: 'Image size must be under 15MB.',
      });
      return;
    }

    setSelectedFile(file);
    // Temporary preview while uploading
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrl(tempUrl);
    setSubmissionError(null);
    setUploadError(null);

    // Immediately trigger real persistent upload
    await performUpload(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadedEvidence(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Submit report to live backend
  const handleSubmit = async () => {
    if (isSubmitting) return; // Prevent duplicate clicks

    // Validation
    if (!description.trim() || description.trim().length < 5) {
      setSubmissionError({
        title: 'Description Required',
        message: 'Please provide at least a brief description (minimum 5 characters) of the situation.',
      });
      setStep(4);
      return;
    }

    // Verify persistent evidence if a photo was selected
    if (selectedFile) {
      if (isUploading) {
        setSubmissionError({
          title: 'Evidence Upload In Progress',
          message: 'Please wait for your photographic evidence to finish uploading before submitting.',
        });
        setStep(2);
        return;
      }
      if (uploadError || !uploadedEvidence) {
        setSubmissionError({
          title: 'Evidence Upload Failed',
          message: 'Unable to upload image. Please retry uploading your photo or remove it to proceed.',
        });
        setStep(2);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setSubmissionError(null);

      // Submit citizen report to backend with canonical source: "WEB_PORTAL"
      const currentUser = authService.getCurrentUser();
      const payload: SubmitReportPayload = {
        categoryHint: normalizeCategory(category),
        description: description.trim(),
        location: {
          type: 'Point',
          coordinates: [coords.lng, coords.lat],
          address: `${address.trim()} (${ward})`,
        },
        evidenceIds: uploadedEvidence ? [uploadedEvidence.id] : [],
        source: 'WEB_PORTAL', // Canonical backend enum value
        reporterId: currentUser?.id,
      };

      const reportResult = await reportService.submitReport(payload);

      if (reportResult.success && reportResult.data) {
        const incidentRecord: any = reportResult.data.incident || reportResult.data;
        setCreatedIncident(incidentRecord);
        // Refresh centralized incidents cache & clear local stale caches
        incidentService.invalidateCache();
        refreshIncidents().catch(() => {});

        // React-Toastify Success Notification
        const incNumber =
          incidentRecord?.incidentNumber ||
          (incidentRecord?._id ? `INC-2026-${incidentRecord._id.slice(-4).toUpperCase()}` : '');
        toast.success(
          `Report submitted successfully${incNumber ? ` • ${incNumber} created` : ''}`,
          {
            toastId: `submit-success-${incidentRecord?._id || incidentRecord?.id || Date.now()}`,
          }
        );
      } else {
        throw new Error(reportResult.error?.message || 'Failed to submit report.');
      }
    } catch (err: any) {
      console.error('[ReportIssuePage Submit Error]', err);
      // Map error gracefully; NEVER display raw backend JSON
      setSubmissionError(formatApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 6: Post-Submit Processing Screen & Preview Flags
  const isPreviewLoading = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('loading') === 'true';
  const isPreviewSubmitted = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('submitted') === 'true';

  // Step 7: Incident Created Success Screen state
  const activeIncident = createdIncident || (isPreviewSubmitted ? ({
    _id: 'INC-2026-1028',
    incidentNumber: 'INC-2026-1028',
    category: 'POTHOLE',
    title: 'Pothole on MG Road',
    location: {
      address: 'MG Road, Near Central Bus Terminus (Ward 12 - Central Hosur)',
      ward: 'Ward 12 - Central Hosur',
    },
    severity: 'EVALUATING',
    status: 'SUBMITTED',
    sla: { targetHours: 24 },
    department: { name: 'Parks & Environment' },
    createdAt: '2026-09-30T16:38:00Z',
  } as any) : null);

  // Lock outer scroll container on desktop so loading and confirmation screens fit 100% within the viewport without scrollbars
  useEffect(() => {
    if (activeIncident || isSubmitting || isPreviewLoading) {
      const scrollContainers = document.querySelectorAll('.overflow-y-auto');
      const originalStyles: Array<{ el: HTMLElement; overflowY: string; paddingBottom: string }> = [];

      scrollContainers.forEach((el) => {
        const htmlEl = el as HTMLElement;
        originalStyles.push({
          el: htmlEl,
          overflowY: htmlEl.style.overflowY,
          paddingBottom: htmlEl.style.paddingBottom,
        });
      });

      const applyScrollLock = () => {
        const isDesktop = window.innerWidth >= 768;
        scrollContainers.forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (isDesktop) {
            htmlEl.style.overflowY = 'hidden';
            htmlEl.style.paddingBottom = '0px';
          } else {
            const orig = originalStyles.find((s) => s.el === htmlEl);
            htmlEl.style.overflowY = orig ? orig.overflowY : '';
            htmlEl.style.paddingBottom = orig ? orig.paddingBottom : '';
          }
        });
      };

      applyScrollLock();
      window.addEventListener('resize', applyScrollLock);

      return () => {
        window.removeEventListener('resize', applyScrollLock);
        originalStyles.forEach(({ el, overflowY, paddingBottom }) => {
          el.style.overflowY = overflowY;
          el.style.paddingBottom = paddingBottom;
        });
      };
    }
  }, [activeIncident, isSubmitting, isPreviewLoading]);

  if (isSubmitting || isPreviewLoading) {
    return (
      <div className="relative -mx-4 sm:-mx-5 lg:-mx-[28px] -mt-3.5 sm:-mt-4 -mb-4 min-h-[calc(100vh-62px)] md:h-[calc(100vh-62px)] md:max-h-[calc(100vh-62px)] flex items-center justify-center overflow-x-hidden overflow-y-visible md:overflow-hidden py-4 pb-28 md:py-4 px-4 select-none">
        {/* Shared Atmospheric CivicPulse Cityscape Background */}
        <CivicCityscapeBackground />

        {/* Centered White Rounded Processing Card */}
        <div className="relative z-10 w-full max-w-[580px] bg-white border border-[#E3EAE6] rounded-[22px] shadow-[0_12px_40px_rgba(16,42,67,0.06)] p-6 sm:p-7 text-center animate-in fade-in duration-300">
          {/* Top Document Inspection Badge */}
          <div className="w-12 h-12 rounded-2xl bg-[#DCF5E8] flex items-center justify-center mx-auto mb-3 text-[#109B66]">
            <svg
              className="w-6 h-6 text-[#109B66]"
              viewBox="0 0 28 28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h10l6 6v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
              <polyline points="16 3 16 9 22 9" />
              <line x1="8" y1="13" x2="14" y2="13" />
              <line x1="8" y1="17" x2="12" y2="17" />
              <circle cx="18" cy="19" r="3.5" fill="#DCF5E8" stroke="currentColor" strokeWidth="2" />
              <path d="M20.5 21.5L23 24" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>

          {/* Autonomous Pipeline Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E5F7ED] border border-[#109B66]/15 text-[#109B66] text-[11px] font-semibold mb-2.5">
            <Cpu className="w-3.5 h-3.5 text-[#109B66]" />
            <span>CivicPulse Autonomous Pipeline</span>
          </div>

          {/* Heading */}
          <h2 className="text-[21px] sm:text-[23px] font-bold font-heading text-[#102A43] tracking-[-0.01em] mb-1.5">
            Creating your civic report...
          </h2>

          {/* Supporting Subtext */}
          <p className="text-[12.5px] sm:text-[13px] text-[#6B7F95] font-sans leading-relaxed max-w-[380px] mx-auto mb-6 sm:mb-7">
            Your report is being processed by our autonomous agents.
            <br />
            This may take a few moments.
          </p>

          {/* Horizontal 4-Stage Processing Pipeline */}
          <div className="relative mb-6 sm:mb-7">
            {/* Connecting progress lines behind circles */}
            <div className="absolute top-[15px] left-[12.5%] w-[25%] h-[2.5px] bg-[#109B66] overflow-hidden">
              <motion.div
                className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />
            </div>
            <div className="absolute top-[15px] left-[37.5%] w-[50%] h-[2px] bg-[#E2E8F0]" />

            {/* 4 Pipeline Stages */}
            <div className="grid grid-cols-4 gap-2 relative z-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#109B66] text-white flex items-center justify-center shadow-[0_2px_8px_rgba(16,155,102,0.35)] ring-4 ring-[#109B66]/20 transition-all">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-[11.5px] sm:text-[12px] font-bold text-[#109B66] leading-tight mt-2">
                  Ingesting Details
                </p>
                <p className="text-[10px] sm:text-[10.5px] text-[#7E92A5] leading-snug mt-0.5">
                  Preparing submission
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#EDF2F7] text-[#71879D] flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[#71879D]" />
                </div>
                <p className="text-[11.5px] sm:text-[12px] font-bold text-[#102A43] leading-tight mt-2">
                  Analyzing Location
                </p>
                <p className="text-[10px] sm:text-[10.5px] text-[#7E92A5] leading-snug mt-0.5">
                  Verifying coordinates
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#EDF2F7] text-[#71879D] flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5 text-[#71879D]" />
                </div>
                <p className="text-[11.5px] sm:text-[12px] font-bold text-[#102A43] leading-tight mt-2">
                  Assessing Severity
                </p>
                <p className="text-[10px] sm:text-[10.5px] text-[#7E92A5] leading-snug mt-0.5">
                  AI risk ranking
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <div className="w-8 h-8 rounded-full bg-[#EDF2F7] text-[#71879D] flex items-center justify-center">
                  <LuSend className="w-3.5 h-3.5 text-[#71879D]" />
                </div>
                <p className="text-[11.5px] sm:text-[12px] font-bold text-[#102A43] leading-tight mt-2">
                  Routing
                </p>
                <p className="text-[10px] sm:text-[10.5px] text-[#7E92A5] leading-snug mt-0.5">
                  Assigning team
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Security Notice Box */}
          <div className="rounded-xl bg-[#F8FAF8] border border-[#E6EDE8] p-3 px-3.5 sm:px-4 flex items-center gap-3 text-left">
            <div className="w-8 h-8 rounded-lg bg-[#E4F6EC] text-[#109B66] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#109B66]" />
            </div>
            <div className="space-y-0.5 min-w-0">
              <p className="text-[12px] font-bold text-[#102A43] leading-tight">
                Your report is safe and secure
              </p>
              <p className="text-[10.5px] sm:text-[11px] text-[#6B7F95] leading-snug">
                All uploaded data is encrypted and processed through CivicPulse.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (activeIncident) {
    const rawIncidentNum = activeIncident.incidentNumber;
    const incidentTargetId = activeIncident._id || activeIncident.id || '';
    const displayIncidentNumber =
      rawIncidentNum && rawIncidentNum !== 'INC-2026-LIVE'
        ? rawIncidentNum
        : incidentTargetId && incidentTargetId.length >= 4
        ? `INC-2026-${incidentTargetId.slice(-4).toUpperCase()}`
        : 'INC-2026-1028';

    const categoryLabel =
      getCategoryDisplayLabel(activeIncident.category) ||
      selectedCategoryObj.label ||
      'Pothole & Road Damage';

    const departmentName =
      activeIncident.department?.name ||
      activeIncident.departmentId?.name ||
      selectedCategoryObj.department ||
      'Parks & Environment';

    const severityValue = activeIncident.severity || 'EVALUATING';

    const slaTarget = activeIncident.sla?.targetHours
      ? `Within ${activeIncident.sla.targetHours} Hours`
      : 'Within 24 Hours';

    const rawAddress = activeIncident.location?.address || `${address} (${ward})`;
    const addressMatch = rawAddress.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    const mainAddressLine = addressMatch?.[1]?.trim() || rawAddress;
    const wardLine = activeIncident.location?.ward || addressMatch?.[2]?.trim() || ward || 'Ward 12 - Central Hosur';

    // Dynamic title: e.g. "Pothole on MG Road"
    const incidentTitle =
      activeIncident.title && !activeIncident.title.toLowerCase().includes('multi-factor')
        ? activeIncident.title
        : mainAddressLine
        ? `${categoryLabel.split('&')[0].trim()} on ${mainAddressLine.split(',')[0].trim()}`
        : 'Pothole on MG Road';

    // Image source: uploaded evidence or high-resolution category photo
    const evidenceImg =
      (uploadedEvidence as any)?.previewUrl ||
      previewUrl ||
      (uploadedEvidence?.fileUrl ? getEvidenceImageUrl(uploadedEvidence.fileUrl) : null) ||
      (category === 'STREETLIGHT'
        ? '/assets/images/citizen_streetlight.jpg'
        : '/assets/images/citizen_pothole.jpg');

    // Reported on formatted string: e.g. "30 Sep 2026, 04:38 PM"
    const createdAtDate = activeIncident.createdAt ? new Date(activeIncident.createdAt) : new Date();
    const formattedDate =
      createdAtDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ', ' +
      createdAtDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const handleReset = () => {
      setCreatedIncident(null);
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadedEvidence(null);
      setDescription('');
      setCategory('POTHOLE');
      setStep(1);
    };

    return (
      <div className="relative -mx-4 sm:-mx-5 lg:-mx-[28px] -mt-3.5 sm:-mt-4 -mb-4 min-h-[calc(100vh-62px)] md:h-[calc(100vh-62px)] md:max-h-[calc(100vh-62px)] flex flex-col justify-start md:flex-row md:items-center md:justify-center overflow-x-hidden overflow-y-visible md:overflow-hidden pt-3 sm:pt-4 pb-32 md:py-3 px-4 select-none">
        {/* Shared Atmospheric CivicPulse Cityscape Background */}
        <CivicCityscapeBackground />

        {/* Centered Main Content Wrapper */}
        <div className="relative z-10 w-full max-w-[840px] mx-auto space-y-3 sm:space-y-3 animate-in fade-in duration-300">
          {/* =========================================================================
              1. INCIDENT SUMMARY CARD
              ========================================================================= */}
          <div className="w-full bg-white border border-[#E1E8E4] rounded-[16px] md:rounded-[18px] shadow-[0_4px_20px_rgba(16,42,67,0.04)] p-4 sm:p-4 text-left">
            {/* ----------------------------------------------------
                MOBILE LAYOUT (< 768px): Purpose-built mobile design
                ---------------------------------------------------- */}
            <div className="block md:hidden">
              {/* Top Row: Photo + Category, Title, Location */}
              <div className="flex items-start gap-3">
                {/* Photo thumbnail - 96px, rounded corners, preserves aspect ratio */}
                <div className="w-[96px] h-[96px] rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80 shadow-2xs">
                  <img
                    src={evidenceImg}
                    alt={incidentTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  {/* Category Pill */}
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EBF3FD] border border-[#2878E5]/20 text-[#2878E5] text-[10.5px] font-semibold mb-1">
                    <LuConstruction className="w-3 h-3 shrink-0" />
                    <span className="truncate">{categoryLabel}</span>
                  </div>

                  {/* Title (max 20px) */}
                  <h2 className="text-[17px] font-bold font-heading text-[#102A43] tracking-tight leading-snug line-clamp-2">
                    {incidentTitle}
                  </h2>

                  {/* Location (13px) */}
                  <div className="flex items-start gap-1 text-[13px] text-[#526777] mt-1">
                    <LuMapPin className="w-3.5 h-3.5 text-[#526777] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#102A43] leading-tight line-clamp-1">
                        {mainAddressLine}
                      </p>
                      <p className="text-[11px] text-[#6B7F95] mt-0.5 leading-tight">
                        {wardLine}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status: SUBMITTED (11-12px) */}
              <div className="flex justify-end mt-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-[11.5px] font-bold font-heading">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                  <span>Status: {activeIncident.status || 'SUBMITTED'}</span>
                </span>
              </div>

              {/* Horizontal Divider */}
              <div className="border-t border-[#F0F4F2] my-3" />

              {/* 2x2 Info Grid with wrapping department text */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                {/* Severity */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF6EC] text-[#F2B84B] flex items-center justify-center shrink-0 mt-0.5">
                    <LuTriangleAlert className="w-3.5 h-3.5 text-[#F2B84B]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10.5px] text-[#6B7F95] uppercase font-bold tracking-wider font-heading block leading-none">
                      Severity
                    </span>
                    <span className="text-[13px] font-bold text-[#E88C15] uppercase tracking-wide block mt-1 leading-snug">
                      {severityValue}
                    </span>
                  </div>
                </div>

                {/* Assigned Department */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#EBF7F2] text-[#159A68] flex items-center justify-center shrink-0 mt-0.5">
                    <LuBuilding2 className="w-3.5 h-3.5 text-[#159A68]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10.5px] text-[#6B7F95] uppercase font-bold tracking-wider font-heading block leading-none">
                      Assigned Department
                    </span>
                    <span className="text-[13px] font-bold text-[#102A43] block mt-1 leading-snug break-words">
                      {departmentName}
                    </span>
                  </div>
                </div>

                {/* Target SLA */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F0F4F8] text-[#526777] flex items-center justify-center shrink-0 mt-0.5">
                    <LuClock className="w-3.5 h-3.5 text-[#526777]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10.5px] text-[#6B7F95] uppercase font-bold tracking-wider font-heading block leading-none">
                      Target SLA
                    </span>
                    <span className="text-[13px] font-bold text-[#102A43] block mt-1 leading-snug">
                      {slaTarget}
                    </span>
                  </div>
                </div>

                {/* Reported On */}
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F0F4F8] text-[#526777] flex items-center justify-center shrink-0 mt-0.5">
                    <LuCalendar className="w-3.5 h-3.5 text-[#526777]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10.5px] text-[#6B7F95] uppercase font-bold tracking-wider font-heading block leading-none">
                      Reported On
                    </span>
                    <span className="text-[12.5px] font-bold text-[#102A43] block mt-1 leading-snug">
                      {formattedDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                DESKTOP LAYOUT (>= 768px): Completely untouched desktop UI
                ---------------------------------------------------- */}
            <div className="hidden md:flex md:items-center justify-between gap-3.5 sm:gap-4">
              {/* Left & Middle Block */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
                {/* Photo thumbnail */}
                <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200/80 shadow-2xs">
                  <img
                    src={evidenceImg}
                    alt={incidentTitle}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  {/* Category Pill */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EBF3FD] border border-[#2878E5]/20 text-[#2878E5] text-[10.5px] sm:text-[11px] font-semibold">
                    <LuConstruction className="w-3 h-3" />
                    <span>{categoryLabel}</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-[16px] sm:text-[17.5px] font-bold font-heading text-[#102A43] tracking-tight leading-snug mt-1 mb-0.5 truncate">
                    {incidentTitle}
                  </h2>

                  {/* Location */}
                  <div className="flex items-start gap-1.5 text-[12px] sm:text-[12.5px] text-[#526777]">
                    <LuMapPin className="w-3.5 h-3.5 text-[#526777] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="font-semibold text-[#102A43] truncate leading-tight">
                        {mainAddressLine}
                      </p>
                      <p className="text-[10.5px] text-[#6B7F95] mt-0.5 truncate leading-tight">
                        {wardLine}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle Middle Vertical Divider */}
              <div className="w-[1px] bg-[#F0F4F2] self-stretch hidden md:block" />

              {/* Right Metadata & Status Section */}
              <div className="flex flex-col justify-between shrink-0 md:min-w-[310px]">
                {/* Top-Right Status Badge */}
                <div className="flex justify-end mb-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F7F0] border border-[#159A68]/20 text-[#159A68] text-[10.5px] sm:text-[11px] font-bold font-heading">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                    <span>Status: {activeIncident.status || 'SUBMITTED'}</span>
                  </span>
                </div>

                {/* 2x2 Info Grid */}
                <div className="grid grid-cols-2 gap-x-3.5 gap-y-2">
                  {/* Severity */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FEF6EC] text-[#F2B84B] flex items-center justify-center shrink-0">
                      <LuTriangleAlert className="w-3.5 h-3.5 text-[#F2B84B]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9.5px] text-[#6B7F95] uppercase font-bold tracking-wider font-heading block leading-none">
                        Severity
                      </span>
                      <span className="text-[11px] sm:text-[11.5px] font-bold text-[#E88C15] uppercase tracking-wide block mt-0.5 truncate leading-tight">
                        {severityValue}
                      </span>
                    </div>
                  </div>

                  {/* Assigned Department */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#EBF7F2] text-[#159A68] flex items-center justify-center shrink-0">
                      <LuBuilding2 className="w-3.5 h-3.5 text-[#159A68]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9.5px] text-[#6B7F95] uppercase font-bold tracking-wider font-heading block leading-none">
                        Assigned Department
                      </span>
                      <span className="text-[11px] sm:text-[11.5px] font-bold text-[#102A43] block mt-0.5 truncate leading-tight">
                        {departmentName}
                      </span>
                    </div>
                  </div>

                  {/* Target SLA */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F0F4F8] text-[#526777] flex items-center justify-center shrink-0">
                      <LuClock className="w-3.5 h-3.5 text-[#526777]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9.5px] text-[#6B7F95] uppercase font-bold tracking-wider font-heading block leading-none">
                        Target SLA
                      </span>
                      <span className="text-[11px] sm:text-[11.5px] font-bold text-[#102A43] block mt-0.5 truncate leading-tight">
                        {slaTarget}
                      </span>
                    </div>
                  </div>

                  {/* Reported On */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#F0F4F8] text-[#526777] flex items-center justify-center shrink-0">
                      <LuCalendar className="w-3.5 h-3.5 text-[#526777]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9.5px] text-[#6B7F95] uppercase font-bold tracking-wider font-heading block leading-none">
                        Reported On
                      </span>
                      <span className="text-[10.5px] sm:text-[11px] font-bold text-[#102A43] block mt-0.5 truncate leading-tight">
                        {formattedDate}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              2. CIVIC OPERATIONS PIPELINE CARD
              ========================================================================= */}
          <div className="w-full bg-white border border-[#E1E8E4] rounded-[16px] md:rounded-[18px] shadow-[0_4px_20px_rgba(16,42,67,0.04)] p-4 sm:p-4 text-left">
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F4F2] mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 text-[#159A68] shrink-0 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-[#159A68]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
                    <circle cx="12" cy="3" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="21" r="1.5" fill="currentColor" />
                    <circle cx="3" cy="12" r="1.5" fill="currentColor" />
                    <circle cx="21" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="text-[14px] sm:text-[15px] font-bold font-heading text-[#102A43] truncate">
                  Civic Operations Pipeline
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7F7F0] border border-[#159A68]/15 text-[#159A68] text-[10.5px] sm:text-[11px] font-semibold shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#159A68]" />
                <span>Autonomous Routing Active</span>
              </span>
            </div>

            {/* Mobile Vertical Stepper (< 768px) */}
            <div className="block md:hidden space-y-0 relative pl-1 py-0.5">
              {/* Stage 1: Report Ingested */}
              <div className="flex items-start gap-3 relative pb-3.5">
                <div className="absolute left-[13px] top-[26px] bottom-0 w-[2px] bg-[#159A68]" />
                <div className="w-7 h-7 rounded-full bg-[#159A68] text-white flex items-center justify-center shrink-0 shadow-xs relative z-10">
                  <LuCheck className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[12px] font-bold text-[#102A43] leading-tight">
                    Report Ingested
                  </p>
                  <p className="text-[11px] text-[#6B7F95] leading-snug mt-0.5">
                    Evidence registered
                  </p>
                </div>
              </div>

              {/* Stage 2: AI Understands */}
              <div className="flex items-start gap-3 relative pb-3.5">
                <div className="absolute left-[13px] top-[26px] bottom-0 w-[2px] bg-[#E2E8F0]" />
                <div className="w-7 h-7 rounded-full bg-[#159A68] text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-[#159A68]/20 animate-pulse relative z-10">
                  <LuFileText className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[12px] font-bold text-[#159A68] leading-tight">
                    AI Understands
                  </p>
                  <p className="text-[11px] text-[#6B7F95] leading-snug mt-0.5">
                    Vision & NLP triage
                  </p>
                </div>
              </div>

              {/* Stage 3: Severity & SLA */}
              <div className="flex items-start gap-3 relative pb-3.5">
                <div className="absolute left-[13px] top-[26px] bottom-0 w-[2px] bg-[#E2E8F0]" />
                <div className="w-7 h-7 rounded-full bg-[#F0F4F8] text-[#829AB1] flex items-center justify-center shrink-0 relative z-10">
                  <LuActivity className="w-3.5 h-3.5 text-[#829AB1]" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[12px] font-bold text-[#102A43] leading-tight">
                    Severity & SLA
                  </p>
                  <p className="text-[11px] text-[#6B7F95] leading-snug mt-0.5">
                    Priority ranking
                  </p>
                </div>
              </div>

              {/* Stage 4: Field Response */}
              <div className="flex items-start gap-3 relative">
                <div className="w-7 h-7 rounded-full bg-[#F0F4F8] text-[#829AB1] flex items-center justify-center shrink-0 relative z-10">
                  <LuSend className="w-3.5 h-3.5 text-[#829AB1]" />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[12px] font-bold text-[#102A43] leading-tight">
                    Field Response
                  </p>
                  <p className="text-[11px] text-[#6B7F95] leading-snug mt-0.5">
                    Assigning crew
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Horizontal 4-Stage Pipeline (>= 768px) */}
            <div className="hidden md:block relative mb-1">
              {/* Connecting progress lines behind circles */}
              <div className="absolute top-[15px] left-[12.5%] w-[25%] h-[2.5px] bg-[#159A68] overflow-hidden">
                <motion.div
                  className="w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>
              <div className="absolute top-[15px] left-[37.5%] w-[50%] h-[2px] bg-[#E2E8F0]" />

              {/* 4 Pipeline Stages */}
              <div className="grid grid-cols-4 gap-2 relative z-10 text-center">
                {/* Stage 1: Report Ingested (Completed) */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#159A68] text-white flex items-center justify-center shadow-xs">
                    <LuCheck className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <p className="text-[11.5px] sm:text-[12px] font-bold text-[#102A43] leading-tight mt-2">
                    Report Ingested
                  </p>
                  <p className="text-[10px] sm:text-[10.5px] text-[#6B7F95] leading-snug mt-0.5">
                    Evidence registered
                  </p>
                </div>

                {/* Stage 2: AI Understands (Current / Active) */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#159A68] text-white flex items-center justify-center shadow-xs ring-6 ring-[#159A68]/20 animate-pulse relative z-10">
                    <LuFileText className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-[11.5px] sm:text-[12px] font-bold text-[#102A43] leading-tight mt-2">
                    AI Understands
                  </p>
                  <p className="text-[10px] sm:text-[10.5px] text-[#6B7F95] leading-snug mt-0.5">
                    Vision & NLP triage
                  </p>
                </div>

                {/* Stage 3: Severity & SLA (Pending) */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#F0F4F8] text-[#829AB1] flex items-center justify-center">
                    <LuActivity className="w-3.5 h-3.5 text-[#829AB1]" />
                  </div>
                  <p className="text-[11.5px] sm:text-[12px] font-bold text-[#102A43] leading-tight mt-2">
                    Severity & SLA
                  </p>
                  <p className="text-[10px] sm:text-[10.5px] text-[#6B7F95] leading-snug mt-0.5">
                    Priority ranking
                  </p>
                </div>

                {/* Stage 4: Field Response (Pending) */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-[#F0F4F8] text-[#829AB1] flex items-center justify-center">
                    <LuSend className="w-3.5 h-3.5 text-[#829AB1]" />
                  </div>
                  <p className="text-[11.5px] sm:text-[12px] font-bold text-[#102A43] leading-tight mt-2">
                    Field Response
                  </p>
                  <p className="text-[10px] sm:text-[10.5px] text-[#6B7F95] leading-snug mt-0.5">
                    Assigning crew
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =========================================================================
              3. ACTION BUTTONS
              ========================================================================= */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-2 md:gap-2.5 w-full pt-1">
            {incidentTargetId && (
              <button
                type="button"
                onClick={() => navigate(`/citizen/incidents/${incidentTargetId}`)}
                className="w-full md:w-auto h-[46px] md:h-[40px] px-5 sm:px-6 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-[13px] md:text-[12.5px] font-bold shadow-md shadow-[#159A68]/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
              >
                <LuEye className="w-4 h-4 md:w-3.5 md:h-3.5" />
                <span>View Incident</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => navigate('/citizen/incidents')}
              className="w-full md:w-auto h-[46px] md:h-[40px] px-4 sm:px-5 rounded-xl bg-white hover:bg-slate-50 border border-[#E1E8E4] text-[#102A43] text-[13px] md:text-[12.5px] font-bold shadow-2xs transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <LuFileText className="w-4 h-4 md:w-3.5 md:h-3.5 text-[#526777]" />
              <span>Track My Incidents</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="w-full md:w-auto h-[46px] md:h-[40px] px-4 sm:px-5 rounded-xl bg-white hover:bg-slate-50 border border-[#E1E8E4] text-[#102A43] text-[13px] md:text-[12.5px] font-bold shadow-2xs transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
            >
              <LuPlus className="w-4 h-4 md:w-3.5 md:h-3.5 text-[#526777]" />
              <span>Report Another Problem</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCategoryItem = CATEGORIES.find((c) => c.id === category);

  const STEP_NAMES: Record<number, string> = {
    1: 'CATEGORY',
    2: 'EVIDENCE',
    3: 'LOCATION',
    4: 'DETAILS',
    5: 'REVIEW',
  };

  const handleNavBack = () => {
    if (step === 1) {
      navigate('/citizen/incidents');
    } else {
      setStep((prev) => Math.max(prev - 1, 1));
    }
  };

  // Active Report Creation Workflow (Steps 1 to 5)
  return (
    <CitizenContentContainer className="space-y-3.5 sm:space-y-4">
      {/* 1. Top Context Bar (Back, Report a Civic Problem, Step Indicator) */}
      <ReportTopNav
        currentStep={step}
        totalSteps={5}
        stepName={STEP_NAMES[step] || 'CATEGORY'}
        onBack={handleNavBack}
      />

      {/* 2. Compact Process Rail */}
      <ReportProcessRail
        currentStep={step}
        onStepClick={(targetStep) => {
          if (targetStep < step) setStep(targetStep);
        }}
      />

      {/* Human-Friendly Error Banner (Preserves form data on failure) */}
      {submissionError && (
        <div className="p-4 rounded-2xl bg-[#FDEEED] border border-[#EF6A63]/30 text-left flex items-start justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#EF6A63] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-[#102A43] font-heading">{submissionError.title}</h4>
              <p className="text-xs text-[#526777] mt-0.5 leading-relaxed">{submissionError.message}</p>
              <p className="text-[11px] text-[#6B7C8F] mt-1 font-medium">
                Your report draft is still saved locally. You can review and submit again.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {step === 5 && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-3 py-1.5 rounded-lg bg-[#EF6A63] hover:bg-[#D9534F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Try Again
              </button>
            )}
            <button
              type="button"
              onClick={() => setSubmissionError(null)}
              className="text-xs text-[#6B7C8F] hover:text-[#102A43] px-2 py-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* STEP 1: Cinematic Intelligent Intake Experience */}
      {step === 1 && (
        <>
          {/* Traveling Signal Pulse from Card to Intake Node */}
          <SignalTravelOverlay
            originRect={originCardRect}
            targetRect={targetIntakeRect}
          />

          <motion.div
            initial={{ opacity: 1, x: 0 }}
            animate={{
              opacity: isTransitioningStep ? 0 : 1,
              x: isTransitioningStep ? -20 : 0,
            }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start"
          >
            {/* Left Column (approx 58–60% width): Category Selection Workspace */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-3.5 text-left">
              <div className="bg-white rounded-2xl border border-[#E3EAE6] p-4 sm:p-5 shadow-[0_4px_24px_rgba(15,40,30,0.04)] space-y-3">
                {/* Conversational Heading */}
                <div className="space-y-0.5">
                  <h3 className="text-lg sm:text-xl font-extrabold font-heading text-[#102A43] tracking-tight">
                    What happened?
                  </h3>
                  <p className="text-xs text-[#6B7C8F]">
                    Choose the issue that best describes what you noticed.
                  </p>
                </div>

                {/* 8 Compact Category Tiles (2 columns x 4 rows) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {CATEGORIES.map((c) => (
                    <CategoryTile
                      key={c.id}
                      category={c}
                      isSelected={category === c.id}
                      onSelect={(catId, originRect) => handleSelectCategory(catId, originRect)}
                    />
                  ))}
                </div>

                {/* Bottom Actions Row: Microcopy + Continue Button */}
                <div className="pt-3 border-t border-[#E3EAE6]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-[11.5px] text-[#6B7C8F] leading-tight flex items-center gap-1.5 max-w-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#159A68] shrink-0" />
                    <span>Your category helps CivicPulse route the report to the right city team.</span>
                  </p>

                  <motion.button
                    type="button"
                    onClick={handleContinueToEvidence}
                    disabled={!category || isTransitioningStep}
                    whileHover={category && !isTransitioningStep ? { scale: 1.015, y: -1 } : {}}
                    whileTap={category && !isTransitioningStep ? { scale: 0.985 } : {}}
                    className={cn(
                      'inline-flex items-center justify-center gap-2 px-6 h-11 rounded-xl text-xs sm:text-[13px] font-heading font-extrabold shadow-md transition-all select-none cursor-pointer',
                      category
                        ? 'bg-[#159A68] hover:bg-[#128358] text-white shadow-[#159A68]/20 group active:scale-98'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                    )}
                  >
                    <span>Continue to Evidence</span>
                    <motion.span
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <LuArrowRight className="w-4 h-4 text-white" />
                    </motion.span>
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Right Column (approx 40–42% width): Animated AI Intake Visualization + Compact Report Dossier */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-3.5">
              {/* 1. Animated Intelligent Intake Visualization (Signature Interaction) */}
              <CivicIntakeVisualization
                intakeRef={intakeContainerRef}
                selectedCategory={category}
                categoryLabel={selectedCategoryObj?.label}
                intakeStage={intakeStage}
              />

              {/* 2. Compact Report Dossier + Dynamic System Understanding */}
              <ReportDossierCompact
                selectedCategory={selectedCategoryObj}
                wardName={ward}
                hasEvidence={Boolean(uploadedEvidence)}
                intakeReady={intakeStage === 'READY'}
              />
            </div>
          </motion.div>
        </>
      )}

      {/* STEPS 2 to 5: Evidence, Location, Details, Review */}
      {step > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-8 xl:col-span-8 space-y-6">

      {/* STEP 2: Evidence Upload */}
      {step === 2 && (
        <div className="p-6 sm:p-8 bg-white border border-[#E3EAE6] shadow-[0_8px_30px_rgba(16,42,67,0.06)] rounded-[20px] space-y-6 text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-heading text-[#102A43]">
              Show us what you found
            </h3>
            <p className="text-xs text-[#6B7C8F]">
              Clear photos help our Vision Agent evaluate hazard severity and dispatch the right equipment.
            </p>
          </div>

          {/* Hidden File & Camera Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Upload Error Banner with Retry */}
          {uploadError && (
            <div className="p-4 rounded-2xl bg-[#FDEEED] border border-[#EF6A63]/30 text-left flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5 text-[#102A43]">
                <AlertTriangle className="w-5 h-5 text-[#EF6A63] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#102A43] font-heading">Unable to upload image</p>
                  <p className="text-[11px] text-[#6B7C8F]">Please try again or select another image.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => selectedFile && performUpload(selectedFile)}
                className="px-3.5 py-1.5 rounded-xl bg-[#EF6A63] hover:bg-[#D9534F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                Retry Upload
              </button>
            </div>
          )}

          {isUploading ? (
            /* Upload in Progress Indicator */
            <div className="p-10 rounded-2xl border border-[#E3EAE6] bg-[#FAF8F5] text-center space-y-3 animate-in fade-in duration-200">
              <Loader2 className="w-8 h-8 animate-spin text-[#159A68] mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#102A43] font-heading">Uploading evidence...</p>
                <p className="text-xs text-[#6B7C8F]">Securing photographic proof in municipal persistent storage</p>
              </div>
            </div>
          ) : !previewUrl ? (
            /* Upload Dropzone */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E3EAE6] hover:border-[#159A68] rounded-2xl p-8 sm:p-10 text-center bg-[#FAF8F5]/60 hover:bg-[#E7F7F0]/20 transition-all cursor-pointer space-y-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#E7F7F0] text-[#159A68] mx-auto flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <Camera className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#102A43] font-heading">
                  Drag and drop photo here, or browse
                </p>
                <p className="text-xs text-[#6B7C8F]">
                  Supports JPEG, PNG, WebP up to 15MB
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] border border-[#E3EAE6] text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-[#159A68]" />
                  <span>Take Photo</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload from Device</span>
                </button>
              </div>
            </div>
          ) : (
            /* Persistent Photographic Evidence Preview */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-[#102A43] font-heading">
                  <Camera className="w-4 h-4 text-[#159A68]" />
                  <span>📷 Evidence</span>
                </div>
                {uploadedEvidence && (
                  <span className="text-[11px] font-bold text-[#159A68] bg-[#E7F7F0] px-2.5 py-0.5 rounded-full border border-[#159A68]/20 flex items-center gap-1 font-heading">
                    <Check className="w-3 h-3 stroke-[3]" />
                    <span>✓ Image uploaded</span>
                  </span>
                )}
              </div>

              <div className="relative rounded-2xl overflow-hidden border border-[#E3EAE6] bg-slate-900 group max-h-80 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Captured Evidence Preview"
                  className="w-full max-h-80 object-contain rounded-2xl bg-black/40"
                />
                <div className="absolute top-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white transition-all shadow-md cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Photo Information & Controls */}
              <div className="p-4 rounded-xl bg-white border border-[#E3EAE6] flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#E7F7F0] text-[#159A68] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold text-[#102A43] truncate">
                      {selectedFile?.name || uploadedEvidence?.fileUrl?.split('/').pop() || 'evidence-photo.jpg'}
                    </p>
                    <p className="text-[11px] text-[#159A68] font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{uploadedEvidence ? 'Image uploaded and verified' : 'Uploading...'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg border border-[#E3EAE6] hover:bg-slate-50 text-xs font-semibold text-[#102A43] transition-all cursor-pointer"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#EF6A63] hover:bg-red-50 transition-all cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t border-[#E3EAE6]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E3EAE6] hover:bg-slate-50 text-xs font-semibold text-[#102A43] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (isUploading) {
                  setSubmissionError({
                    title: 'Evidence Upload In Progress',
                    message: 'Please wait for your photographic evidence to finish uploading before continuing.',
                  });
                  return;
                }
                if (uploadError) {
                  setSubmissionError({
                    title: 'Evidence Upload Failed',
                    message: 'Unable to upload image. Please retry uploading your photo or remove it to proceed.',
                  });
                  return;
                }
                setSubmissionError(null);
                setStep(3);
              }}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-bold shadow-md shadow-[#159A68]/20 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              <span>{isUploading ? 'Uploading Evidence...' : 'Continue to Location'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Location */}
      {step === 3 && (
        <div className="p-6 sm:p-8 bg-white border border-[#E3EAE6] shadow-[0_8px_30px_rgba(16,42,67,0.06)] rounded-[20px] space-y-6 text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-heading text-[#102A43]">
              Where is the issue located?
            </h3>
            <p className="text-xs text-[#6B7C8F]">
              Precise location ensures our Location Agent maps the jurisdiction and dispatches the nearby ward team.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5 font-heading">
                Street Address or Nearest Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. MG Road, Near Central Bus Terminus"
                className="w-full px-4 py-2.5 bg-white border border-[#E3EAE6] hover:border-[#102A43]/20 focus:border-[#159A68] focus:ring-2 focus:ring-[#159A68]/20 rounded-xl text-xs text-[#102A43] shadow-xs outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#102A43] mb-1.5 font-heading">
                Municipal Ward / Jurisdiction (Hosur)
              </label>
              <select
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-[#E3EAE6] hover:border-[#102A43]/20 focus:border-[#159A68] focus:ring-2 focus:ring-[#159A68]/20 rounded-xl text-xs text-[#102A43] shadow-xs outline-none transition-all"
              >
                {WARDS_LIST.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            {/* GPS Telemetry Card */}
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E7F7F0] text-[#159A68] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#102A43] font-mono">
                      {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#36B37E] animate-pulse" />
                  </div>
                  <p className="text-[11px] text-[#6B7C8F]">
                    {coords.accuracy ? `Accuracy ±${coords.accuracy}m • ` : ''}Hosur Urban Jurisdiction
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={requestLocation}
                disabled={isLocating}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#102A43] border border-[#E3EAE6] text-xs font-semibold shadow-xs transition-all cursor-pointer shrink-0"
              >
                <Navigation className={cn('w-3.5 h-3.5 text-[#159A68]', isLocating ? 'animate-spin' : '')} />
                <span>{isLocating ? 'Acquiring...' : 'Use My Current Location'}</span>
              </button>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#E3EAE6]">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E3EAE6] hover:bg-slate-50 text-xs font-semibold text-[#102A43] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-bold shadow-md shadow-[#159A68]/20 transition-all cursor-pointer active:scale-98"
            >
              <span>Continue to Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Description */}
      {step === 4 && (
        <div className="p-6 sm:p-8 bg-white border border-[#E3EAE6] shadow-[0_8px_30px_rgba(16,42,67,0.06)] rounded-[20px] space-y-6 text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-heading text-[#102A43]">
              What happened?
            </h3>
            <p className="text-xs text-[#6B7C8F]">
              Tell us what you noticed. Mention anything that could help the field team bring the right equipment.
            </p>
          </div>

          <div className="space-y-2">
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us what you noticed. Mention depth, traffic impact, danger to pedestrians, or best time to inspect..."
              className="w-full p-4 bg-white border border-[#E3EAE6] hover:border-[#102A43]/20 focus:border-[#159A68] focus:ring-2 focus:ring-[#159A68]/20 rounded-2xl text-xs sm:text-sm text-[#102A43] placeholder-[#829AB1] shadow-xs outline-none transition-all leading-relaxed"
            />
            <div className="flex items-center justify-between text-[11px] text-[#6B7C8F] px-1">
              <span>Minimum 5 characters required</span>
              <span>{description.length} / 2000 characters</span>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-[#E3EAE6]">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E3EAE6] hover:bg-slate-50 text-xs font-semibold text-[#102A43] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (description.trim().length < 5) {
                  setSubmissionError({
                    title: 'Description Too Short',
                    message: 'Please provide at least a brief description of the issue.',
                  });
                  return;
                }
                setSubmissionError(null);
                setStep(5);
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-bold shadow-md shadow-[#159A68]/20 transition-all cursor-pointer active:scale-98"
            >
              <span>Review & Submit</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review & Submit */}
      {step === 5 && (
        <div className="p-6 sm:p-8 bg-white border border-[#E3EAE6] shadow-[0_8px_30px_rgba(16,42,67,0.06)] rounded-[20px] space-y-6 text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-heading text-[#102A43]">
              Review your submission
            </h3>
            <p className="text-xs text-[#6B7C8F]">
              Verify your report details before triggering autonomous triage.
            </p>
          </div>

          {/* 2-Column Review Layout: Evidence on Left / Details on Right */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left Column: Real Photographic Preview */}
            <div className="md:col-span-5 space-y-3">
              <span className="text-[11px] font-bold text-[#6B7C8F] uppercase tracking-wider font-heading block">
                EVIDENCE PHOTO
              </span>
              {previewUrl ? (
                <div className="rounded-2xl border border-[#E3EAE6] overflow-hidden bg-slate-900 shadow-sm relative group max-h-56 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Evidence Preview"
                    className="w-full max-h-56 object-cover rounded-2xl"
                  />
                  <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10.5px] truncate">
                    {selectedFile?.name || 'evidence-photo.jpg'}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl border border-dashed border-[#E3EAE6] text-center bg-[#FAF8F5] space-y-2">
                  <Camera className="w-8 h-8 text-[#829AB1] mx-auto" />
                  <p className="text-xs font-semibold text-[#102A43]">No Photo Attached</p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-[11px] font-bold text-[#159A68] hover:underline cursor-pointer"
                  >
                    + Add Evidence Photo
                  </button>
                </div>
              )}
            </div>

            {/* Right Column: Citizen Provided Data + System Analysis Notice */}
            <div className="md:col-span-7 space-y-4">
              {/* Citizen Information Card */}
              <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] space-y-3 text-xs">
                <span className="text-[10px] font-bold text-[#159A68] uppercase tracking-wider font-heading block">
                  CITIZEN REPORT DETAILS
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[#6B7C8F] text-[11px]">Category</p>
                    <p className="font-bold text-[#102A43] text-xs mt-0.5">{selectedCategoryObj.label}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7C8F] text-[11px]">Ward Jurisdiction</p>
                    <p className="font-bold text-[#102A43] text-xs mt-0.5">{ward}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[#6B7C8F] text-[11px]">Location Landmark</p>
                  <p className="font-medium text-[#102A43] text-xs mt-0.5">{address}</p>
                </div>

                <div>
                  <p className="text-[#6B7C8F] text-[11px]">Situation Context</p>
                  <p className="text-[#102A43] text-xs mt-0.5 leading-relaxed bg-white p-2.5 rounded-lg border border-[#E3EAE6]">
                    {description}
                  </p>
                </div>
              </div>

              {/* System Information (Pending Triage) */}
              <div className="p-4 rounded-xl bg-white border border-[#E3EAE6] space-y-2 text-xs">
                <span className="text-[10px] font-bold text-[#6B7C8F] uppercase tracking-wider font-heading block">
                  SYSTEM TRIAGE TARGETS (PENDING SUBMISSION)
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[#6B7C8F]">Expected Dept:</span>
                    <p className="font-semibold text-[#159A68]">{selectedCategoryObj.department}</p>
                  </div>
                  <div>
                    <span className="text-[#6B7C8F]">Severity:</span>
                    <p className="font-semibold text-[#102A43]">Evaluated via Vision Agent</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between pt-4 border-t border-[#E3EAE6]">
            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E3EAE6] hover:bg-slate-50 text-xs font-semibold text-[#102A43] transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#159A68] hover:bg-[#128358] text-white text-xs font-bold shadow-md shadow-[#159A68]/25 transition-all cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Live Pipeline...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Confirm & Submit Report</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>

        {/* Right Column (4 cols): Live Report Dossier Summary */}
        <div className="lg:col-span-4 xl:col-span-4 space-y-6">
          <CitizenCard className="p-5 sm:p-6 space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-[#E3EAE6]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#E7F7F0] text-[#159A68] flex items-center justify-center font-bold text-xs">
                  {step}
                </div>
                <h3 className="font-bold text-sm text-[#102A43] font-heading">Report Dossier Draft</h3>
              </div>
              <span className="text-[11px] font-semibold text-[#159A68] bg-[#E7F7F0] px-2 py-0.5 rounded-full">
                {Math.round((step / 5) * 100)}% Complete
              </span>
            </div>

            {/* Selected Hazard Category */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#829AB1] uppercase tracking-wider">Hazard Category</span>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] flex items-center gap-3">
                <div className={cn("p-2 rounded-xl shrink-0", currentCategoryItem?.accentBg || "bg-slate-100")}>
                  {currentCategoryItem?.icon || <Construction className="w-4 h-4 text-[#2878E5]" />}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="font-bold text-xs text-[#102A43] truncate">
                    {currentCategoryItem?.label || 'Not Selected'}
                  </div>
                  <div className="text-[10px] text-[#6B7C8F] truncate">
                    {currentCategoryItem?.department || 'Select in Step 1'}
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Preview */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#829AB1] uppercase tracking-wider">Photo Evidence</span>
              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-[#E3EAE6] aspect-video bg-black/5">
                  <img src={previewUrl} alt="Hazard preview" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                    Evidence Attached
                  </span>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FAF8F5] border border-dashed border-[#E3EAE6] text-center text-xs text-[#829AB1]">
                  <span>Upload photo in Step 2</span>
                </div>
              )}
            </div>

            {/* Location & Ward */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#829AB1] uppercase tracking-wider">Location & Ward</span>
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E3EAE6] text-xs text-[#526777] space-y-1 text-left">
                <div className="flex items-center gap-1.5 font-semibold text-[#102A43]">
                  <MapPin className="w-3.5 h-3.5 text-[#159A68] shrink-0" />
                  <span className="truncate">{address || 'Ward 12, Hosur'}</span>
                </div>
                <div className="text-[10px] text-[#829AB1] pl-5">
                  {coords.lat.toFixed(4)}° N, {coords.lng.toFixed(4)}° E
                </div>
              </div>
            </div>

            {/* Severity / Triage Priority */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#829AB1] uppercase tracking-wider">Triage Urgency</span>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-heading bg-amber-50 text-amber-700 border border-amber-200">
                  STANDARD FIELD DISPATCH
                </span>
              </div>
            </div>

            {/* Autonomous Dispatch Intelligence Card */}
            <div className="pt-3 border-t border-[#E3EAE6]">
              <div className="p-3 rounded-xl bg-[#E7F7F0]/60 border border-[#159A68]/20 text-[11px] text-[#102A43] space-y-1 text-left">
                <div className="flex items-center gap-1.5 font-bold text-[#159A68]">
                  <Bot className="w-3.5 h-3.5" />
                  <span>Autonomous Ingestion Ready</span>
                </div>
                <p className="text-[10px] text-[#526777] leading-relaxed">
                  Upon submission, multimodal agents verify hazard depth, deduplicate GIS coordinates, and assign the nearest municipal response unit.
                </p>
              </div>
            </div>
          </CitizenCard>
        </div>
      </div>
      )}
    </CitizenContentContainer>
  );
}

export default ReportIssuePage;
