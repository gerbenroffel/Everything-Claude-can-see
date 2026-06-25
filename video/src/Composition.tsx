import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

const BG = '#0f172a';
const BLUE = '#4a9eed';
const WHITE = '#e5e5e5';
const MUTED = '#94a3b8';
const SCENE = 90;

function useFadeSlide(delay = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 80 } });
  const opacity = interpolate(progress, [0, 1], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [40, 0]);
  return { opacity, transform: `translateY(${translateY}px)` };
}

const Scene1: React.FC = () => {
  const name = useFadeSlide(0);
  const sub = useFadeSlide(8);
  const line = useFadeSlide(14);
  return (
    <AbsoluteFill style={{ background: BG, justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 24 }}>
      <div style={{ width: 80, height: 4, background: BLUE, borderRadius: 2, ...line }} />
      <div style={{ fontSize: 96, fontWeight: 800, color: WHITE, letterSpacing: -2, fontFamily: 'sans-serif', ...name }}>
        Gerben Roffel
      </div>
      <div style={{ fontSize: 32, color: MUTED, fontFamily: 'sans-serif', letterSpacing: 1, ...sub }}>
        Global Head of Ethics & Compliance
      </div>
    </AbsoluteFill>
  );
};

const Scene2: React.FC = () => {
  const label = useFadeSlide(0);
  const line1 = useFadeSlide(6);
  const line2 = useFadeSlide(12);
  return (
    <AbsoluteFill style={{ background: BG, justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'column', paddingLeft: 160 }}>
      <div style={{ fontSize: 22, color: BLUE, letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: 32, ...label }}>
        Role
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, color: WHITE, fontFamily: 'sans-serif', lineHeight: 1.15, maxWidth: 900, ...line1 }}>
        Ethics & Compliance
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, color: BLUE, fontFamily: 'sans-serif', lineHeight: 1.15, maxWidth: 900, ...line2 }}>
        Chief HR & Employment Counsel
      </div>
    </AbsoluteFill>
  );
};

const Scene3: React.FC = () => {
  const label = useFadeSlide(0);
  const t1 = useFadeSlide(6);
  const t2 = useFadeSlide(14);
  const t3 = useFadeSlide(22);
  return (
    <AbsoluteFill style={{ background: '#0a1628', justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'column', paddingLeft: 160 }}>
      <div style={{ fontSize: 22, color: BLUE, letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: 48, ...label }}>
        What I'm solving
      </div>
      <div style={{ fontSize: 48, fontWeight: 600, color: WHITE, fontFamily: 'sans-serif', lineHeight: 1.4, maxWidth: 1100, ...t1 }}>
        Portfolio companies that report
      </div>
      <div style={{ fontSize: 48, fontWeight: 600, color: WHITE, fontFamily: 'sans-serif', lineHeight: 1.4, maxWidth: 1100, ...t2 }}>
        and adhere to minimum standards.
      </div>
      <div style={{ fontSize: 36, color: MUTED, fontFamily: 'sans-serif', lineHeight: 1.5, maxWidth: 1000, marginTop: 32, ...t3 }}>
        Employment law for Prosus leadership.
      </div>
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ text: string; style: React.CSSProperties }> = ({ text, style }) => (
  <div style={{
    display: 'inline-block',
    background: 'rgba(74,158,237,0.12)',
    border: '2px solid rgba(74,158,237,0.4)',
    borderRadius: 12,
    padding: '20px 40px',
    fontSize: 40,
    fontWeight: 600,
    color: WHITE,
    fontFamily: 'sans-serif',
    ...style,
  }}>
    {text}
  </div>
);

const Scene4: React.FC = () => {
  const label = useFadeSlide(0);
  const p1 = useFadeSlide(6);
  const p2 = useFadeSlide(14);
  const p3 = useFadeSlide(22);
  return (
    <AbsoluteFill style={{ background: BG, justifyContent: 'center', alignItems: 'flex-start', flexDirection: 'column', paddingLeft: 160, gap: 32 }}>
      <div style={{ fontSize: 22, color: BLUE, letterSpacing: 4, textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: 16, ...label }}>
        How I work
      </div>
      <Pill text="Business & clients first" style={p1} />
      <Pill text="Why before how" style={p2} />
      <Pill text="Direct. No disclaimers." style={p3} />
    </AbsoluteFill>
  );
};

export const GerbenIntro: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <Sequence from={0} durationInFrames={SCENE}><Scene1 /></Sequence>
    <Sequence from={SCENE} durationInFrames={SCENE}><Scene2 /></Sequence>
    <Sequence from={SCENE * 2} durationInFrames={SCENE}><Scene3 /></Sequence>
    <Sequence from={SCENE * 3} durationInFrames={SCENE}><Scene4 /></Sequence>
  </AbsoluteFill>
);
