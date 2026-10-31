import { formatMoney } from '../utils/format';
import { ChevronDownIcon, SliceIcon } from './icons';
import './TopBar.css';

export const BRANCHES = ['Soho', 'Shoreditch', 'Camden'] as const;
export type Branch = (typeof BRANCHES)[number];
export type ConnectionStatus = 'connecting' | 'live' | 'reconnecting';

const CONNECTION_LABEL: Record<ConnectionStatus, string> = {
  connecting: 'Lighting the oven',
  live: 'Oven hot',
  reconnecting: 'Reconnecting',
};

export interface TopBarProps {
  connection: ConnectionStatus;
  /** Net takings today, in pence */
  takings: number;
  branch: Branch;
  /** Part 1: controls whether the menu is shown. Part 3: make this internal state (see docs/PART-3) */
  menuOpen?: boolean;
}

export function TopBar({ connection, takings, branch, menuOpen = false }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-mark">
          <SliceIcon size={22} />
        </span>
        <span className="brand-name">Slice Rush</span>
        <span className="brand-tag">Kitchen</span>
      </div>

      <nav className="topnav" aria-label="Main">
        <a className="topnav-link active" aria-current="page" href="#kitchen">
          Kitchen
        </a>
        <a className="topnav-link" href="#menu">
          Menu
        </a>
        <a className="topnav-link" href="#reports">
          Reports
        </a>
      </nav>

      <div className="topbar-spacer" />

      <div className={`conn conn-${connection}`} role="status">
        <span className="conn-dot" aria-hidden="true" />
        <span className="conn-label">{CONNECTION_LABEL[connection]}</span>
      </div>

      <div className="takings-pill">
        <span className="takings-label">Today</span>
        <span className="takings-value num">{formatMoney(takings)}</span>
      </div>

      <div className="branch">
        <button className="branch-button" aria-haspopup="menu" aria-expanded={menuOpen}>
          <span className="branch-avatar" aria-hidden="true">
            {branch.slice(0, 2).toUpperCase()}
          </span>
          <span className="branch-name">{branch}</span>
          <ChevronDownIcon className="branch-chevron" size={14} />
        </button>
        {menuOpen && (
          <ul className="branch-menu" role="menu" aria-label="Switch branch">
            {BRANCHES.map((b) => (
              <li key={b} role="none">
                <button role="menuitemradio" aria-checked={b === branch} className="branch-menu-item">
                  {b}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
