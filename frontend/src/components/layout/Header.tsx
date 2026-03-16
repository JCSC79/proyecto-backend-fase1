import React from 'react';
import { Navbar, Icon, ProgressBar, Button } from "@blueprintjs/core";

/**
 * Header Component
 * Enhanced with larger text and icons for better visibility
 */
interface HeaderProps {
  progress: number;
}

export const Header: React.FC<HeaderProps> = ({ progress }) => {
  const percentage = Math.round(progress * 100);

  return (
    <Navbar className="bp4-dark" style={{ height: '60px', padding: '10px 20px' }}>
      <Navbar.Group align="left">
        <Navbar.Heading style={{ fontSize: '20px' }}>
          <Icon icon="layers" intent="primary" size={25} style={{ marginRight: '12px' }} />
          <strong>TASK MANAGER PRO</strong>
        </Navbar.Heading>
        <Navbar.Divider />
        <Button className="bp4-minimal" icon="home" text="Home" large />
        <Button className="bp4-minimal" icon="dashboard" text="Dashboard" active large />
      </Navbar.Group>

      <Navbar.Group align="right">
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '25px' }}>
          <span style={{ fontSize: '14px', fontWeight: 500, marginRight: '12px', color: '#a7b6c2' }}>
            BOARD PROGRESS: {percentage}%
          </span>
          <ProgressBar 
            intent={percentage === 100 ? "success" : "primary"} 
            value={progress} 
            style={{ width: '150px', height: '10px' }} 
            stripes={percentage < 100}
          />
        </div>
        <Navbar.Divider />
        <Button className="bp4-minimal" icon="user" large />
        <Button className="bp4-minimal" icon="cog" large />
      </Navbar.Group>
    </Navbar>
  );
};