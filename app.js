/* ── Scroll-spy: active nav link matches section in view ── */
(function () {
  function initBody() {
    document.body.classList.add('preset-mono', 'floor-75', 'contrast-default', 'motion-full');
  }

  var sections = document.querySelectorAll('main section[id]');
  var navLinks = document.querySelectorAll('.tnav a[href^="#"]');

  var spyObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(function (sec) { spyObserver.observe(sec); });

  initBody();
})();

/* ── Work: accordion + thesis typewriter ── */
document.querySelectorAll('.wrow-head').forEach(function (h) {
  h.addEventListener('click', function () { h.parentElement.classList.toggle('open'); });
});

(function () {
  var el = document.getElementById('thesis');
  var tokens = [
    { t: 'The same security method, a new surface each time: ' },
    { t: 'Software', c: 'f-sec' },
    { t: ' → ' },
    { t: 'AI', c: 'f-ai' },
    { t: ' → ' },
    { t: 'Fintech', c: 'f-fin' },
    { t: '.' },
  ];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    tokens.forEach(function (tok) { var s = document.createElement('span'); if (tok.c) s.className = tok.c; s.textContent = tok.t; el.appendChild(s); });
    return;
  }
  var chars = [];
  var busy = false;
  var caret = null;

  tokens.forEach(function (tok) { tok.t.split('').forEach(function (ch) { chars.push({ ch: ch, c: tok.c }); }); });

  function runTypewriter(delay) {
    if (busy) return;
    busy = true;
    el.textContent = '';
    caret = document.createElement('span');
    caret.className = 'caret';
    caret.textContent = '_';
    el.appendChild(caret);
    var i = 0, cur = null, curClass = '__none';
    function tick() {
      if (i >= chars.length) {
        busy = false;
        if (caret) caret.remove();
        return;
      }
      var ch = chars[i].ch, c = chars[i].c;
      var cls = c || '';
      if (cls !== curClass) {
        cur = document.createElement('span');
        if (cls) cur.className = cls;
        el.insertBefore(cur, caret);
        curClass = cls;
      }
      cur.textContent += ch;
      i++;
      setTimeout(tick, ch === ' ' ? 20 : 28);
    }
    setTimeout(tick, delay || 0);
  }
  runTypewriter(350);
  el.addEventListener('mouseenter', function () { runTypewriter(0); });
})();

/* ── Writing filesystem browser ── */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animTimers = [];
  var animRafs = [];

  function cancelAll() {
    animTimers.forEach(function (id) { clearTimeout(id); });
    animRafs.forEach(function (id) { cancelAnimationFrame(id); });
    animTimers = []; animRafs = [];
  }
  function later(fn, ms) { var id = setTimeout(fn, ms); animTimers.push(id); return id; }
  function raf2(fn) { var id = requestAnimationFrame(fn); animRafs.push(id); return id; }

  /* ------------------------------------------------------------------ */
  /* ENTRY DATA                                                           */
  /* ------------------------------------------------------------------ */
  var ENTRIES = {
    three: {
      breadcrumb: '~/writeups/hack-the-box/three',
      name: 'Three',
      platform: 'HackTheBox',
      os: 'Linux',
      owasp: 'A05:2021',
      domain: 'sec',
      chain: ['subdomain enum', 'S3 anon write (awscli)', 'webshell upload', 'RCE'],
      cve: null,
      vulnClass: 'S3 bucket misconfiguration / unauthenticated write',
      threatContext: 'Writable S3 buckets are a first-day finding in cloud reviews. Unauthenticated write to a web-root bucket is the same misconfiguration class that surfaces in production cloud audits, the attack surface I hardened across AWS service teams.',
      detectionVector: 'CloudTrail: `s3:PutObject` from unauthenticated principal. S3 Access Logs flagging anonymous write activity. AWS Config rule `s3-bucket-public-write-prohibited` non-compliant alert.',
      remediation: 'Block anonymous writes via bucket ACL and Block Public Access settings. Never configure an S3 bucket as a public web root without strict read-only policy. Enable Object Lock on sensitive storage.',
      tags: ['aws', 's3', 'misconfig', 'rce'],
      url: 'https://github.com/pratty010/Boxes/blob/master/Hack%20The%20Box/Very%20Easy/Unix/3/Solve.md'
    },
    responder: {
      breadcrumb: '~/writeups/hack-the-box/responder',
      name: 'Responder',
      platform: 'HackTheBox',
      os: 'Windows',
      owasp: 'A03:2021',
      domain: 'sec',
      chain: ['LFI', 'RFI NTLM capture (Responder)', 'JtR NetNTLMv2', 'Evil-WinRM'],
      cve: null,
      vulnClass: 'Local file inclusion to NTLM hash capture',
      threatContext: 'LFI-to-NTLM relay is a canonical lateral movement path in Active Directory environments. The same class of input-path injection that AppSec reviews prioritize when auditing enterprise web apps talking to Windows backends.',
      detectionVector: 'Windows Event ID 4648 spike from unexpected hosts. Network monitoring for SMB traffic to non-DC IPs. SIEM rule: NetNTLMv2 hash capture signature from Responder tooling.',
      remediation: 'Whitelist file-path parameters and reject traversal sequences. Enforce SMB signing to block relay attacks. Disable NTLM where Kerberos is available in the environment.',
      tags: ['lfi', 'ntlm', 'hash-cracking', 'winrm'],
      url: 'https://github.com/pratty010/Boxes/blob/master/Hack%20The%20Box/Very%20Easy/Windows/Responder/Solve.md'
    },
    pennyworth: {
      breadcrumb: '~/writeups/hack-the-box/pennyworth',
      name: 'Pennyworth',
      platform: 'HackTheBox',
      os: 'Linux',
      owasp: 'A07:2021',
      domain: 'sec',
      chain: ['Jenkins 2.289', 'default creds', 'Groovy Script Console', 'reverse shell'],
      cve: null,
      vulnClass: 'Default credentials to Jenkins Script Console RCE',
      threatContext: 'Exposed CI/CD consoles with weak credentials are a direct supply-chain foothold, a priority surface in cloud-native AppSec reviews. The Jenkins Groovy Script Console is arbitrary code execution once authenticated.',
      detectionVector: 'SIEM alert on failed-then-successful auth to CI/CD tooling from new source IPs. Process spawn anomalies from the jenkins user. Network monitoring for outbound reverse shell connections from build agents.',
      remediation: 'Rotate all CI/CD default credentials at deploy time. Disable the Groovy Script Console in production. Network-restrict Jenkins to internal routing only. Enforce SSO with MFA.',
      tags: ['jenkins', 'ci-cd', 'default-creds', 'groovy'],
      url: 'https://github.com/pratty010/Boxes/blob/master/Hack%20The%20Box/Very%20Easy/Unix/Pennyworth/Solve.md'
    },
    vaccine: {
      breadcrumb: '~/writeups/hack-the-box/vaccine',
      name: 'Vaccine',
      platform: 'HackTheBox',
      os: 'Linux',
      owasp: 'A03:2021',
      domain: 'sec',
      chain: ['anon FTP', 'zip2john + JtR', 'SQLi os-shell', 'sudo vi GTFOBins'],
      cve: null,
      vulnClass: 'SQL injection + sudo misconfiguration',
      threatContext: 'SQLi to an OS shell via `--os-shell` is bread-and-butter application security review. Combined with an over-privileged sudo entry, two independent findings chain into full system compromise, the exact pairing AppSec reviews are designed to surface before attackers do.',
      detectionVector: 'WAF alert on SQLi patterns in HTTP parameters. Database audit log showing OS command execution calls. SIEM rule: sudo invocations of GTFOBins binaries (vi, less, find) with NOPASSWD by service accounts.',
      remediation: 'Parameterized queries eliminate SQLi entirely. Least-privilege DB service accounts prevent OS-shell escalation. Audit all sudoers entries and remove GTFOBins-exploitable binaries from NOPASSWD grants.',
      tags: ['sqli', 'sqlmap', 'gtfobins', 'privesc'],
      url: 'https://github.com/pratty010/Boxes/blob/master/Hack%20The%20Box/Very%20Easy/Unix/Vaccine/Solve.md'
    },
    'agent-sudo': {
      breadcrumb: '~/writeups/tryhackme/agent-sudo',
      name: 'Agent Sudo',
      platform: 'TryHackMe',
      os: 'Linux',
      owasp: 'A05:2021',
      domain: 'sec',
      chain: ['UA enum', 'FTP brute', 'stego extract', 'sudo -u#-1 bypass'],
      cve: 'CVE-2019-14287',
      vulnClass: 'Sudo security-policy bypass via UID -1',
      threatContext: 'CVE-2019-14287 shows why patch hygiene on privilege tooling is non-negotiable. Sudo runs on virtually every Linux host; a single unpatched version with `!root` in sudoers becomes a reliable local root bypass.',
      detectionVector: 'Auditd rule on sudo invocations with numeric UID arguments. SIEM alert on privilege escalation events (execve on sudo with uid=-1). Anomaly: sudo called with negative user ID by non-root process.',
      remediation: 'Patch sudo to 1.8.28 or later. Remove `!root` from sudoers entries and use explicit user allowlists. Enforce OS-level auto-patching for privilege tooling.',
      tags: ['sudo', 'cve', 'stego', 'privesc'],
      url: 'https://github.com/pratty010/Boxes/blob/master/Try%20Hack%20Me/Easy/Agent%20Sudo/Write_Up.md'
    },
    tomghost: {
      breadcrumb: '~/writeups/tryhackme/tomghost',
      name: 'TomGhost',
      platform: 'TryHackMe',
      os: 'Linux',
      owasp: 'A06:2021',
      domain: 'sec',
      chain: ['AJP Ghostcat file read', 'leaked SSH creds', 'GPG crack', 'sudo zip GTFOBins'],
      cve: 'CVE-2020-1938',
      vulnClass: 'Apache Tomcat AJP unauthenticated file read',
      threatContext: 'Ghostcat hit millions of Tomcat deployments. Exposed AJP connectors still lurk in legacy Java stacks; an unpatched Tomcat before 9.0.31 leaks WEB-INF files including credentials to any unauthenticated AJP client.',
      detectionVector: 'Network monitoring for inbound AJP traffic (port 8009) from non-load-balancer IPs. IDS signature for Ghostcat request pattern. SIEM alert: connections to 8009 from external address ranges.',
      remediation: 'Patch Tomcat past 9.0.31. Firewall port 8009 or disable the AJP connector in server.xml. Keep credentials out of WEB-INF configuration files entirely.',
      tags: ['tomcat', 'ajp', 'ghostcat', 'gpg'],
      url: 'https://github.com/pratty010/Boxes/blob/master/Try%20Hack%20Me/Easy/TomGhost/Write_Up.md'
    },
    'git-happens': {
      breadcrumb: '~/writeups/tryhackme/git-happens',
      name: 'Git Happens',
      platform: 'TryHackMe',
      os: 'Linux',
      owasp: 'A05:2021',
      domain: 'sec',
      chain: ['exposed .git', 'GitTools dump', 'git log / git show', 'recovered creds'],
      cve: null,
      vulnClass: 'Exposed .git directory / secrets in commit history',
      threatContext: 'Secrets in git history is a first-day finding in cloud reviews, the exact failure mode SAST and secret-scanning tooling exists to catch. An exposed .git directory over HTTP lets an attacker reconstruct the full commit history and recover anything ever committed.',
      detectionVector: 'Web server access logs: GET requests to `/.git/config` or `/.git/HEAD` from non-internal IPs. SIEM alert on path-based access to `.git/` routes. Automated secret-scanning on all branches before merge.',
      remediation: 'Block `.git` directory access at the web server level (nginx: `location /.git { deny all; }`). Run truffleHog or git-secrets on all repository branches. Rotate any credential that was ever committed to history.',
      tags: ['git', 'secrets', 'info-disclosure'],
      url: 'https://github.com/pratty010/Boxes/blob/master/Try%20Hack%20Me/Easy/Git%20Happens/Write_Up.md'
    },
    joker: {
      breadcrumb: '~/writeups/tryhackme/joker',
      name: 'Joker',
      platform: 'TryHackMe',
      os: 'Linux',
      owasp: 'A07:2021',
      domain: 'sec',
      chain: ['HTTP basic brute', 'Joomla template RCE', 'lxd group', 'host mount escape'],
      cve: null,
      vulnClass: 'CMS template RCE + LXD container escape',
      threatContext: 'LXD and Docker group membership is a direct root path in container-heavy cloud environments, a misconfiguration that cloud-native AppSec reviews flag as critical. Two independent misconfigs here chain from web foothold to full host compromise.',
      detectionVector: 'Container runtime audit: new container launches by non-root users. SIEM rule: lxc/docker invocations by web service accounts. Monitor bind-mounts of the host root filesystem from inside running containers.',
      remediation: 'Remove users from lxd/docker groups; use a container orchestrator with least-privilege service accounts. Disable CMS template editing in production. Enforce credential uniqueness across all web admin panels.',
      tags: ['joomla', 'lxd', 'container-escape'],
      url: 'https://github.com/pratty010/Boxes/blob/master/Try%20Hack%20Me/Medium/Joker%20CTF/Write_Up.md'
    },
    'aoc23-day2': {
      breadcrumb: '~/writeups/ctf/aoc-23-day2',
      name: "AoC '23 · Day 2",
      platform: 'TryHackMe',
      os: 'Linux',
      owasp: 'A09:2021',
      domain: 'sec',
      chain: ['auth log import', 'pandas baseline', 'outlier detection', 'attacker identified'],
      cve: null,
      vulnClass: 'Insufficient security logging / SIEM gap detection',
      threatContext: 'Authentication log analysis with statistical baselining is the foundation of UEBA (User and Entity Behavior Analytics). Without it, lateral movement and credential-stuffing attacks blend into normal login traffic and go undetected for weeks.',
      detectionVector: 'SIEM rules for auth volume anomalies per user/hour. Statistical deviation alerts on login rates exceeding 3 standard deviations from baseline. Alert on authentication events outside defined business hours for service accounts.',
      remediation: 'Centralize authentication logs to a SIEM on day one. Define per-user and per-service baseline login rates. Alert on outliers immediately; credential attacks are loud in the logs if anyone is watching.',
      tags: ['log-analysis', 'siem', 'ueba', 'auth'],
      url: 'https://github.com/pratty010/CTF/blob/master/THM%20CTF/Advent%20of%20Cyber/2K23/day_2/Solve.md'
    },
    'aoc23-day3': {
      breadcrumb: '~/writeups/ctf/aoc-23-day3',
      name: "AoC '23 · Day 3",
      platform: 'TryHackMe',
      os: 'Linux',
      owasp: 'A07:2021',
      domain: 'sec',
      chain: ['CeWL wordlist gen', 'Hydra brute force', 'valid creds', 'access'],
      cve: null,
      vulnClass: 'Missing brute-force protection on authentication endpoint',
      threatContext: 'Custom wordlists built from target site content dramatically raise brute-force success rates against credential reuse. Credential-stuffing tools use the same production attack pattern: public breach data combined with site-specific vocabulary.',
      detectionVector: 'WAF rate-limiting alert on rapid sequential POST requests to auth endpoints. SIEM rule: more than 10 failed logins from the same IP in 60 seconds. Account lockout monitoring and alerting in application logs.',
      remediation: 'Account lockout after 5 failed attempts with progressive delay. Rate-limit auth endpoints at the WAF layer. Enforce MFA; brute-forced credentials are useless without the second factor.',
      tags: ['brute-force', 'hydra', 'cewl', 'credential-attack'],
      url: 'https://github.com/pratty010/CTF/blob/master/THM%20CTF/Advent%20of%20Cyber/2K23/day_3/Solve.md'
    },
    'ca23-alien-cradle': {
      breadcrumb: '~/writeups/ctf/htb-ca23/alien-cradle',
      name: 'Alien Cradle',
      platform: 'HTB CTF',
      os: 'Windows',
      owasp: 'A05:2021',
      domain: 'sec',
      chain: ['PS script capture', 'base64 decode', 'IEX deobfuscation', 'C2 URL extracted'],
      cve: null,
      vulnClass: 'PowerShell download cradle / obfuscated malware delivery',
      threatContext: 'PowerShell download cradles are the most common malware delivery mechanism in enterprise environments. Obfuscated PS scripts bypass string-matching AV and abuse trusted Windows binaries to pull and execute payloads, a first-day finding in incident response.',
      detectionVector: 'PowerShell ScriptBlock logging (Event 4104) captures deobfuscated content even when obfuscated at rest. AMSI sends script content to AV before execution. EDR behavioral rule: IEX + WebClient + DownloadString chain from a user process.',
      remediation: 'Enable PowerShell ScriptBlock and Module logging via Group Policy. Enforce Constrained Language Mode on endpoints. Network monitoring for PowerShell-initiated HTTPS connections to external hosts.',
      tags: ['powershell', 'obfuscation', 'malware', 'forensics'],
      url: 'https://github.com/pratty010/CTF/blob/master/HTB%20CTF/CYBER_APOCALYPSE/2K23/Forensics/Alien%20Cradle/Solve.md'
    },
    'ca23-et-persistence': {
      breadcrumb: '~/writeups/ctf/htb-ca23/et-persistence',
      name: 'Extraterrestrial Persistence',
      platform: 'HTB CTF',
      os: 'Linux',
      owasp: 'A05:2021',
      domain: 'sec',
      chain: ['bash script review', 'cron enumeration', 'init script analysis', 'persistence mapped'],
      cve: null,
      vulnClass: 'Linux persistence via cron and init script modification',
      threatContext: 'Persistence via cron and bash init scripts is a T1053/T1546 staple. Attackers plant cron jobs or modify rc.local to survive reboots, the same technique used in cloud instance compromise to maintain access after a patch or restart.',
      detectionVector: 'Auditd rules monitoring writes to /etc/cron*, /var/spool/cron, /etc/rc.local, and ~/.bashrc. SIEM alert on new cron entries by non-root, non-system users. File integrity monitoring on common persistence paths via AIDE or Wazuh.',
      remediation: 'Audit all cron entries and init scripts at deploy time. Enforce immutable infrastructure where instances are replaced rather than modified in production. FIM with alerting on all persistence path modifications.',
      tags: ['persistence', 'cron', 'bash', 'forensics', 'linux'],
      url: 'https://github.com/pratty010/CTF/blob/master/HTB%20CTF/CYBER_APOCALYPSE/2K23/Forensics/Extraterrestrial%20Persistence/solve.py'
    },
    'pico-logon': {
      breadcrumb: '~/writeups/pico-ctf/logon',
      name: 'Logon',
      platform: 'PicoCTF',
      os: 'Web',
      owasp: 'A01:2021',
      domain: 'sec',
      chain: ['login form', 'cookie inspection', 'admin=False', 'cookie edit', 'admin=True', 'flag'],
      cve: null,
      vulnClass: 'Client-side authorization state / cookie tampering',
      threatContext: 'Authorization state stored in cleartext client-side cookies is an inverted trust model: the server trusts client-supplied role values rather than verifying server-side session. A textbook broken access control pattern that still surfaces in production web app reviews.',
      detectionVector: 'Server-side session logs showing role escalation between requests from the same session token. WAF rule flagging known role-related cookie value changes. Anomaly: admin session presented without a corresponding server-side privilege grant event.',
      remediation: 'Never store authorization state client-side in cleartext. Use opaque server-side session tokens. Validate all authorization decisions server-side on every request; client input is always untrusted.',
      tags: ['cookie', 'auth-bypass', 'broken-access-control', 'web'],
      url: 'https://github.com/pratty010/CTF/blob/master/PICO%20CTF/2K19/Web/logon/Solve.md'
    },
    'pico-based': {
      breadcrumb: '~/writeups/pico-ctf/based',
      name: 'Based',
      platform: 'PicoCTF',
      os: 'Linux',
      owasp: 'A02:2021',
      domain: 'sec',
      chain: ['binary decode', 'octal decode', 'hex decode', 'cleartext flag'],
      cve: null,
      vulnClass: 'Encoding chain mistaken for encryption / data obfuscation',
      threatContext: 'Chained encoding (binary, octal, hex, base64) is a common payload obfuscation technique in real malware; it evades string-matching detection and obscures C2 addresses, configuration data, and exfiltration payloads that pass casual inspection.',
      detectionVector: 'YARA rules matching long base64 or hex-encoded strings in network payloads or file uploads. Sandbox dynamic analysis catching decode-and-execute chains. SIEM alert on scripts invoking multiple decode functions on externally sourced data.',
      remediation: 'Treat encoded data from untrusted sources as untrusted data. AMSI and ScriptBlock logging capture decoded content before execution. Network content inspection to decode common encoding schemes and re-scan the plaintext result.',
      tags: ['encoding', 'obfuscation', 'base64', 'malware-evasion'],
      url: 'https://github.com/pratty010/CTF/blob/master/PICO%20CTF/2K19/GS/Based/Solve.md'
    },
    'pico-static': {
      breadcrumb: '~/writeups/pico-ctf/static-aint-always-noise',
      name: "Static Ain't Always Noise",
      platform: 'PicoCTF',
      os: 'Linux',
      owasp: 'A02:2021',
      domain: 'sec',
      chain: ['binary download', 'strings analysis', 'embedded data identified', 'flag extracted'],
      cve: null,
      vulnClass: 'Sensitive data embedded in binary / static file steganography',
      threatContext: 'Data embedded in binary files is an exfiltration and steganography technique. Attackers conceal C2 configs, keys, or stolen data inside binary blobs and static assets that pass casual inspection; the strings command and binwalk are first-line forensic tools for a reason.',
      detectionVector: 'DLP scanning binary file transfers for embedded text patterns. Binwalk or foremost in a sandboxed file analysis pipeline for all uploaded binaries. Anomaly detection on file entropy: structured noise in a binary suggests embedded readable data.',
      remediation: 'Scan all file uploads through binary analysis before storage. Enforce file-type validation by magic bytes, not extension. Log and alert on anomalous binary uploads with high Shannon entropy or embedded readable strings.',
      tags: ['steganography', 'binary-analysis', 'strings', 'forensics'],
      url: 'https://github.com/pratty010/CTF/blob/master/PICO%20CTF/2K21/GS/Static%20aint%20always%20noise/Solve.md'
    },
    'aoc23-day1': {
      breadcrumb: '~/writeups/ctf/aoc23-day1',
      name: "Advent of Cyber '23 · Day 1",
      platform: 'TryHackMe',
      os: 'AI/LLM',
      owasp: 'LLM01',
      domain: 'ai',
      chain: ['direct ask', 'role impersonation', 'maintenance-mode jailbreak'],
      cve: null,
      vulnClass: 'Prompt injection against LLM chatbot',
      threatContext: 'Prompt injection is OWASP LLM01, the same class I built guardrails against on Amazon Bedrock. A naive system prompt can be overridden through user input when both share the same context window, allowing full privilege escalation within the model\'s execution context.',
      detectionVector: 'LLM output monitoring for role-claim patterns in user turns. Input classifier flagging known jailbreak phrases (maintenance mode, DAN, etc.). Anomaly detection on outputs that contradict the system prompt\'s stated restrictions.',
      remediation: 'Privilege-aware system prompts that user input cannot override. Separate execution contexts for user and system instructions. Input/output classifiers for injection patterns. Prefer structured tool calls over free-text role-following.',
      tags: ['prompt-injection', 'llm', 'ai-security'],
      url: 'https://github.com/pratty010/CTF/blob/master/THM%20CTF/Advent%20of%20Cyber/2K23/day_1/Solve.md'
    }
  };

  /* ------------------------------------------------------------------ */
  /* BUILD DETAIL BODY                                                    */
  /* ------------------------------------------------------------------ */
  function buildBody(key) {
    var e = ENTRIES[key];
    var panel = document.createElement('div');
    panel.className = 'detail-body';
    if (!e) return panel;

    /* breadcrumb */
    var bc = document.createElement('div');
    bc.className = 'breadcrumb';
    bc.textContent = e.breadcrumb;
    panel.appendChild(bc);

    /* box name */
    var nameEl = document.createElement('div');
    nameEl.className = 'box-name';
    nameEl.textContent = e.name;
    panel.appendChild(nameEl);

    /* meta row: platform · os · owasp */
    var meta = document.createElement('div');
    meta.className = 'meta-row';

    var mPlatform = document.createElement('span');
    mPlatform.className = 'mtag ' + e.domain;
    mPlatform.textContent = e.platform;
    meta.appendChild(mPlatform);

    var mOs = document.createElement('span');
    mOs.className = 'mtag';
    mOs.textContent = e.os;
    meta.appendChild(mOs);

    var mOwasp = document.createElement('span');
    mOwasp.className = 'mtag owasp';
    mOwasp.textContent = e.owasp;
    meta.appendChild(mOwasp);

    panel.appendChild(meta);

    /* attack path */
    var chainSection = document.createElement('div');
    chainSection.className = 'chain-section';
    var chainLabel = document.createElement('div');
    chainLabel.className = 'chain-label';
    chainLabel.textContent = 'attack path';
    chainSection.appendChild(chainLabel);
    var chainSteps = document.createElement('div');
    chainSteps.className = 'chain-steps';
    e.chain.forEach(function (step, idx) {
      var chip = document.createElement('span');
      chip.className = 'chain-chip';
      chip.textContent = step;
      chainSteps.appendChild(chip);
      if (idx < e.chain.length - 1) {
        var arrow = document.createElement('span');
        arrow.className = 'chain-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        arrow.textContent = '\u2192';
        chainSteps.appendChild(arrow);
      }
    });
    chainSection.appendChild(chainSteps);
    panel.appendChild(chainSection);

    /* exposure: cve (if any) + vuln class */
    var exposureSection = document.createElement('div');
    exposureSection.className = 'exposure-section';
    var exposureLabel = document.createElement('div');
    exposureLabel.className = 'exposure-label';
    exposureLabel.textContent = 'exposure';
    exposureSection.appendChild(exposureLabel);
    var exposureRow = document.createElement('div');
    exposureRow.className = 'exposure-row';
    if (e.cve) {
      var cveChip = document.createElement('span');
      cveChip.className = 'cve-chip';
      var cveIdSpan = document.createElement('span');
      cveIdSpan.className = 'cve-id';
      cveIdSpan.textContent = e.cve;
      cveChip.appendChild(cveIdSpan);
      exposureRow.appendChild(cveChip);
    }
    var vulnText = document.createElement('span');
    vulnText.className = 'vuln-class-text';
    vulnText.textContent = e.vulnClass;
    exposureRow.appendChild(vulnText);
    exposureSection.appendChild(exposureRow);
    panel.appendChild(exposureSection);

    /* threat context */
    var threatSection = document.createElement('div');
    threatSection.className = 'threat-section';
    var threatLabel = document.createElement('div');
    threatLabel.className = 'threat-label';
    threatLabel.textContent = 'threat context';
    threatSection.appendChild(threatLabel);
    var threatText = document.createElement('p');
    threatText.className = 'threat-text';
    threatText.textContent = e.threatContext;
    threatSection.appendChild(threatText);
    panel.appendChild(threatSection);

    /* detection vector */
    var detectSection = document.createElement('div');
    detectSection.className = 'detect-section';
    var detectLabel = document.createElement('div');
    detectLabel.className = 'detect-label';
    detectLabel.textContent = 'detection vector';
    detectSection.appendChild(detectLabel);
    var detectText = document.createElement('p');
    detectText.className = 'detect-text';
    detectText.textContent = e.detectionVector;
    detectSection.appendChild(detectText);
    panel.appendChild(detectSection);

    /* remediation */
    var remSection = document.createElement('div');
    remSection.className = 'rem-section';
    var remLabel = document.createElement('div');
    remLabel.className = 'rem-label';
    remLabel.textContent = 'remediation';
    remSection.appendChild(remLabel);
    var remText = document.createElement('p');
    remText.className = 'rem-text';
    remText.textContent = e.remediation;
    remSection.appendChild(remText);
    panel.appendChild(remSection);

    /* technique tags */
    var tagRow = document.createElement('div');
    tagRow.className = 'tag-row';
    e.tags.forEach(function (t) {
      var span = document.createElement('span');
      span.className = 'ttag-hash';
      span.textContent = '#' + t;
      tagRow.appendChild(span);
    });
    panel.appendChild(tagRow);

    /* write-up link */
    var link = document.createElement('a');
    link.className = 'writeup-link';
    link.href = e.url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.setAttribute('aria-label', 'Open Write Up.md for ' + e.name + ' on GitHub');
    link.textContent = 'open Write_Up.md \u2192';
    panel.appendChild(link);

    return panel;
  }

  /* ------------------------------------------------------------------ */
  /* PLAY DETAIL (fetch + scan animation)                                 */
  /* ------------------------------------------------------------------ */
  function playDetail(key) {
    cancelAll();
    var panel  = document.getElementById('detail-panel');
    var loader = document.getElementById('scan-loader');
    var line   = document.getElementById('scan-line');

    var oldBody = panel.querySelector('.detail-body');
    if (oldBody) oldBody.remove();

    var body = buildBody(key);
    panel.appendChild(body);

    loader.style.opacity = '0';
    line.style.transition = 'none';
    line.style.transform = 'translateY(0)';
    line.style.opacity = '0';

    if (reducedMotion) { body.style.opacity = '1'; return; }

    var e = ENTRIES[key];
    var filename = decodeURIComponent(e.url.split('/').pop());
    var slug = e.breadcrumb.split('/').pop();

    body.style.opacity = '0';
    loader.textContent = '> loading ' + slug + '/' + filename + ' \u2593\u2593\u2593';
    loader.style.opacity = '1';
    line.style.opacity = '1';

    var h = panel.offsetHeight;
    raf2(function () {
      raf2(function () {
        line.style.transition = 'transform 760ms cubic-bezier(0.16,1,0.3,1)';
        line.style.transform = 'translateY(' + h + 'px)';
      });
    });

    later(function () { loader.style.opacity = '0'; }, 430);
    later(function () {
      line.style.opacity = '0';
      line.style.transition = 'none';
      line.style.transform = 'translateY(0)';
      body.style.transition = 'opacity 320ms cubic-bezier(0.16,1,0.3,1)';
      raf2(function () { body.style.opacity = '1'; });
    }, 780);
  }

  /* ------------------------------------------------------------------ */
  /* FOLDER EXPAND / COLLAPSE                                             */
  /* ------------------------------------------------------------------ */
  document.querySelectorAll('.folder-row').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var expanded = btn.getAttribute('aria-expanded') === 'true';
      var list = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      if (expanded) { list.setAttribute('hidden', ''); }
      else { list.removeAttribute('hidden'); }
    });
  });

  /* ------------------------------------------------------------------ */
  /* FILE SELECT                                                          */
  /* ------------------------------------------------------------------ */
  function selectEntry(key) {
    document.querySelectorAll('.file-row').forEach(function (btn) {
      var isThis = btn.getAttribute('data-entry') === key;
      btn.classList.toggle('active', isThis);
      btn.setAttribute('aria-pressed', isThis ? 'true' : 'false');
    });
    playDetail(key);
  }

  document.querySelectorAll('.file-row').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.getAttribute('data-entry');
      if (key) selectEntry(key);
    });
  });

  /* default */
  selectEntry('three');

}());

/* ── Contact strip ── */
var CONTACTS = [
  { ico: 'fa-solid fa-phone',         label: 'Phone',     val: '+91 7042236696',                   sub: 'click to copy', copy: true,  href: null },
  { ico: 'fa-solid fa-envelope',      label: 'Email',     val: 'pratyushprakh@gmail.com',           sub: 'click to copy', copy: true,  href: null },
  { ico: 'fa-brands fa-linkedin',     label: 'LinkedIn',  val: 'linkedin.com/in/pratyush-prakhar', sub: 'opens link',    copy: false, href: 'https://www.linkedin.com/in/pratyush-prakhar' },
  { ico: 'fa-brands fa-github',       label: 'GitHub',    val: 'github.com/pratty010',             sub: 'opens link',    copy: false, href: 'https://github.com/pratty010' },
  { ico: 'fa-solid fa-shield-halved', label: 'TryHackMe', val: 'tryhackme.com/p/5h1nch4nn',       sub: 'opens link',    copy: false, href: 'https://tryhackme.com/p/5h1nch4nn' },
  { ico: 'fa-solid fa-file-lines',    label: 'Resume',    val: 'Resume PDF',                       sub: 'download',      copy: false, href: 'assets/Resume_Prakhar_Pratyush.pdf' }
];

function copyText(text, tip, orig) {
  var p = navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject();
  p.catch(function () {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  });
  tip.innerHTML = '<span style="color:var(--signal)">copied!</span>';
  setTimeout(function () { tip.innerHTML = orig; }, 1600);
}

(function () {
  var strip = document.getElementById('cs');
  CONTACTS.forEach(function (c) {
    var el = document.createElement('a');
    el.className = 'ci';
    el.setAttribute('aria-label', c.label);

    var iEl = document.createElement('i');
    c.ico.split(' ').forEach(function (cls) { iEl.classList.add(cls); });
    el.appendChild(iEl);

    var tip = document.createElement('span');
    tip.className = 'ctip';
    var orig = c.val + '<br><span style="color:var(--ink-4)">' + c.sub + '</span>';
    tip.innerHTML = orig;
    el.appendChild(tip);

    if (c.copy) {
      el.href = '#';
      el.addEventListener('click', function (e) {
        e.preventDefault();
        copyText(c.val, tip, orig);
      });
    } else {
      el.href = c.href;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
    }

    strip.appendChild(el);
  });
})();

/* ── Contact proverb blur-fade ── */
(function () {
  var proverbBox = document.querySelector('.proverb-box');
  var proverb = document.querySelector('#about .proverb');
  var provSub = document.querySelector('#about .prov-sub');
  if (!proverbBox || !proverb || !provSub) return;

  function activate() {
    proverbBox.classList.add('is-active');
    proverb.style.filter = 'blur(0)';
    proverb.style.opacity = '1';
    proverb.style.transform = 'scale(1)';
    provSub.style.opacity = '1';
    provSub.style.transform = 'translateY(0)';
  }

  function deactivate() {
    proverbBox.classList.remove('is-active');
    proverb.style.filter = 'blur(8px)';
    proverb.style.opacity = '0.3';
    proverb.style.transform = 'scale(0.98)';
    provSub.style.opacity = '0';
    provSub.style.transform = 'translateY(5px)';
  }

  function run() {
    deactivate();
    void proverbBox.offsetWidth;
    activate();
  }

  deactivate();
  proverbBox.addEventListener('mouseenter', run);
  proverbBox.addEventListener('focusin', run);
})();

/* ── Project terminal typewriter ── */
(function () {
  var block = document.querySelector('.term-block');
  var cmd = document.querySelector('#term-cmd');
  var outBlock = document.querySelector('.term-out');
  var outText = document.querySelector('.term-out-text');
  var arrow = document.querySelector('.term-arrow');
  if (!block || !cmd || !outText || !arrow) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var command = 'gh repo list --public';
  var output = [
    '<span class="repo">pratty010/Asobiba</span> <span class="dim">Python agent factory, security tooling</span>',
    '<span class="repo">pratty010/F.R.I.D.A.Y.</span> <span class="dim">Agentic research system</span>',
    '<span class="repo">pratty010/Kinyu</span> <span class="dim">Financial data and AI research toolkit</span>',
    '<span class="repo">pratty010/Chishikiko</span> <span class="dim">Systems + ML knowledge base</span>',
    '<span class="repo">pratty010/Boxes</span> <span class="dim">HTB and TryHackMe writeups</span>'
  ].join('\n');

  function reset() {
    cmd.textContent = '';
    outText.innerHTML = '';
    outBlock.classList.remove('is-visible');
    arrow.style.opacity = '0';
  }

  function typeCommand(done) {
    var i = 0;
    function step() {
      cmd.textContent += command[i++];
      if (i < command.length) {
        setTimeout(step, 22);
        return;
      }
      done();
    }
    step();
  }

  function typeOutput() {
    outBlock.classList.add('is-visible');
    arrow.style.opacity = '1';
    var i = 0;
    var plain = output
      .replace(/<span class="repo">/g, '')
      .replace(/<span class="dim">/g, '')
      .replace(/<\/span>/g, '');
    function step() {
      outText.textContent += plain[i++];
      if (i < plain.length) {
        setTimeout(step, 8);
        return;
      }
      outText.innerHTML = output;
    }
    step();
  }

  var running = false;
  function run() {
    if (running) return;
    running = true;
    reset();
    if (reduce) {
      cmd.textContent = command;
      outBlock.classList.add('is-visible');
      arrow.style.opacity = '1';
      outText.innerHTML = output;
      running = false;
      return;
    }
    typeCommand(function () {
      setTimeout(function () {
        typeOutput();
        running = false;
      }, 120);
    });
  }

  block.addEventListener('click', run);
  block.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      run();
    }
  });

  if (reduce) run();
})();

/* ── GPU wipe on hover ── */
(function () {
  var intro = document.querySelector('#writing .intro .gpu-wipe');
  if (!intro) return;

  function run() {
    intro.classList.remove('is-active');
    void intro.offsetWidth;
    intro.classList.add('is-active');
  }

  intro.addEventListener('mouseenter', run);
})();
