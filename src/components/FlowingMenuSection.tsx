'use client';

import React from 'react';
import FlowingMenu from './FlowingMenu';

export const items = [
  { link: '#telemetry',        text: 'Open 3D interface & telemetry' },
  { link: '#flow',             text: 'Flowing Options',               marquee: 'FLOW' },
  { link: '#fleet-governance', text: 'Fleet Governance',              meta: '1' },
  { link: '#action-monitoring',text: 'Action Monitoring' },
  { link: '#threat-forensics', text: 'Threat Forensics',              meta: '183' },
  { link: '#approval-center',  text: 'Approval Center',               meta: '3' },
  { link: '#audit-explorer',   text: 'Audit Explorer' },
  { link: '#attack-simulation',text: 'Attack Simulation' },
  { link: '#gateway-api',      text: 'Gateway & API' }
];

export function FlowingMenuSection() {
  return (
    <div style={{ height: '100vh', position: 'relative' }}>
      <FlowingMenu
        items={items}
        speed={60}
        stretch={0.6}
        magnet={0.25}
        followCursor={0.4}
        showIndex={true}
        showArrow={true}
        align="left"
        dimInactive={true}
        textColor="#ffffff"
        bgColor="#050505"
        marqueeBgColor="#E6CBA8"
        marqueeTextColor="#0A0A0A"
        ariaLabel="AgentLock 2.0 navigation"
      />
    </div>
  );
}

export default FlowingMenuSection;
