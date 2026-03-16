import { Navbar, Alignment, Icon, ProgressBar, Button } from "@blueprintjs/core";

export const Header = () => (
  <Navbar className="bp4-dark">
    <Navbar.Group align={Alignment.LEFT}>
      <Navbar.Heading>
        <Icon icon="style" intent="primary" size={20} style={{ marginRight: '10px' }} />
        <strong>TASK MANAGER PRO</strong>
      </Navbar.Heading>
      <Navbar.Divider />
      <Button className="bp4-minimal" icon="home" text="Home" />
      <Button className="bp4-minimal" icon="dashboard" text="Dashboard" active />
    </Navbar.Group>
    <Navbar.Group align={Alignment.RIGHT}>
      <span style={{ marginRight: '10px' }}>Total Progress: 60%</span>
      <ProgressBar intent="success" value={0.6} style={{ width: '100px', marginRight: '10px' }} />
      <Button className="bp4-minimal" icon="user" />
      <Button className="bp4-minimal" icon="cog" />
    </Navbar.Group>
  </Navbar>
);