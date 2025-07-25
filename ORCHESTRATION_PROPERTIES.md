# KaibanJS Orchestration Properties - Komplette Referenz

Diese Dokumentation erklärt alle neuen Properties für die intelligente Orchestration in KaibanJS im Detail.

## 🏗️ Team Properties (ITeamParams)

### `enableOrchestration?: boolean`
**Default:** `false`  
**Typ:** Boolean (optional)

**Beschreibung:**
Das Master-Control-Flag für alle Orchestration-Features. Wenn `false` (Standard), verhält sich das Team wie normales KaibanJS ohne Orchestration.

**Effekt:**
- `true`: Aktiviert alle intelligenten Orchestration-Features
- `false`: Deaktiviert komplett alle Orchestration-Features, normale KaibanJS-Funktionalität

**Beispiel:**
```javascript
// Normal KaibanJS (bisheriges Verhalten)
const normalTeam = new Team({
  name: 'Standard Team',
  agents: [agent1, agent2],
  tasks: [task1, task2, task3]
  // enableOrchestration: false (default)
});

// Intelligente Orchestration aktiviert
const smartTeam = new Team({
  name: 'Smart Team',
  agents: [agent1, agent2],
  tasks: [],
  enableOrchestration: true, // ERFORDERLICH für Orchestration
  availableTasks: templateTasks
});
```

**Wichtig:** Ohne dieses Flag werden alle anderen Orchestration-Properties ignoriert und Orchestration-Methoden zeigen Warnungen oder werfen Fehler.

---

### `availableTasks?: Task[]`
**Default:** `[]`  
**Typ:** Array von Task-Objekten (optional)

**Beschreibung:**
Repository von Template-Tasks, die der Orchestrator auswählen, anpassen und instanziieren kann.

**Effekt:**
- Bietet dem Orchestrator eine Bibliothek von verfügbaren Tasks
- Tasks mit `template: true` sind ideal für dieses Repository
- Orchestrator kann diese Tasks basierend auf Projektzielen auswählen

**Beispiel:**
```javascript
const templateTasks = [
  new Task({
    description: 'Implementiere Benutzerauthentifizierung',
    expectedOutput: 'Vollständiges Auth-System',
    agent: developer,
    adaptable: true,
    template: true,
    resourceRequirements: {
      estimatedTime: '4-6 Stunden',
      skillsRequired: ['backend', 'security'],
      dependencies: ['database_setup']
    }
  }),
  new Task({
    description: 'Erstelle responsive UI-Komponenten',
    expectedOutput: 'Mobile-first UI-Komponenten',
    agent: designer,
    adaptable: true,
    template: true
  })
];

const team = new Team({
  name: 'Development Team',
  agents: [developer, designer],
  tasks: [],
  enableOrchestration: true,
  availableTasks: templateTasks // Task-Repository
});
```

**Best Practice:** Erstelle wiederverwendbare Template-Tasks mit klaren Beschreibungen und Ressourcenanforderungen.

---

### `allowTaskGeneration?: boolean`
**Default:** `false`  
**Typ:** Boolean (optional)

**Beschreibung:**
Erlaubt dem Orchestrator, neue Tasks autonom zu erstellen, wenn Lücken im Workflow identifiziert werden.

**Effekt:**
- `true`: Orchestrator kann neue Tasks generieren basierend auf Projektzielen
- `false`: Orchestrator kann nur aus `availableTasks` auswählen

**Beispiel:**
```javascript
const team = new Team({
  name: 'Innovative Team',
  agents: [developer, tester],
  tasks: [],
  enableOrchestration: true,
  availableTasks: basicTasks,
  allowTaskGeneration: true, // Erlaubt autonome Task-Erstellung
  orchestrationStrategy: 'Baue eine sichere Webanwendung mit modernem UI'
});

// Der Orchestrator könnte automatisch neue Tasks erstellen wie:
// - "Implementiere API Rate Limiting" (Sicherheitslücke erkannt)
// - "Erstelle E2E Tests" (Testlücke identifiziert)
```

**Anwendungsfälle:**
- Explorative Projekte mit unklaren Anforderungen
- Adaptive Workflows, die sich entwickeln sollen
- Teams mit hoher LLM-Kompetenz

**Vorsicht:** Kann zu unerwarteten Tasks führen. Verwende klare `orchestrationStrategy`.

---

### `orchestrationStrategy?: string`
**Default:** `undefined`  
**Typ:** String (optional)

**Beschreibung:**
Detaillierte Anweisungen für den LLM-basierten Orchestrator über Prioritäten, Arbeitsweise und Ziele.

**Effekt:**
- Leitet Entscheidungen des Orchestrators bei Task-Auswahl und -Anpassung
- Beeinflusst Task-Generierung und Priorisierung
- Wird in allen LLM-Prompts als Kontext verwendet

**Beispiel:**
```javascript
const team = new Team({
  name: 'E-Commerce Team',
  agents: [developer, designer, tester],
  tasks: [],
  enableOrchestration: true,
  availableTasks: ecommerceTasks,
  allowTaskGeneration: true,
  orchestrationStrategy: `
    Du bist ein intelligenter Orchestrator für ein E-Commerce-Entwicklungsteam.
    
    PRIORITÄTEN:
    1. Liefere qualitativ hochwertige Software termingerecht
    2. Halte Code-Qualität >85%
    3. Implementiere Mobile-First Design
    4. Priorisiere Sicherheit und Performance
    
    ARBEITSWEISE:
    - Bevorzuge bewährte Technologien
    - Implementiere umfassende Tests
    - Optimiere für SEO und Conversion
    
    EINSCHRÄNKUNGEN:
    - Keine experimentellen Frameworks
    - Budget: max 200 Entwicklerstunden
    - Deadline: 6 Wochen
  `
});
```

**Best Practice:** Sei spezifisch über Ziele, Einschränkungen und Prioritäten.

---

### `mode?: 'conservative' | 'adaptive' | 'innovative' | 'learning'`
**Default:** `'adaptive'`  
**Typ:** Enum (optional)

**Beschreibung:**
Definiert das Verhalten und die Risikobereitschaft des Orchestrators.

**Modi im Detail:**

#### `'conservative'`
- **Charakteristik:** Vorsichtige Task-Auswahl, strenge Einhaltung von Templates
- **Risikobereitschaft:** Minimal
- **Task-Anpassung:** Begrenzt, nur sicherheitskritische Änderungen
- **Generierung:** Sehr zurückhaltend bei neuen Tasks
- **Ideal für:** Produktionsumgebungen, kritische Systeme, regulierte Branchen

#### `'adaptive'`
- **Charakteristik:** Ausgewogener Ansatz, moderate Task-Anpassung
- **Risikobereitschaft:** Mittel
- **Task-Anpassung:** Responsive auf Kontextänderungen
- **Generierung:** Maßvolle neue Task-Erstellung
- **Ideal für:** Meiste Entwicklungsprojekte, etablierte Teams

#### `'innovative'`
- **Charakteristik:** Kreative Task-Generierung, experimentelle Ansätze
- **Risikobereitschaft:** Hoch
- **Task-Anpassung:** Extensive Anpassungen basierend auf Zielen
- **Generierung:** Proaktive neue Task-Erstellung
- **Ideal für:** Forschung & Entwicklung, Startups, neue Technologien

#### `'learning'`
- **Charakteristik:** Kontinuierliche Verbesserung, Lernen aus Ergebnissen
- **Risikobereitschaft:** Hoch
- **Task-Anpassung:** Evolvierende Strategien basierend auf Outcomes
- **Generierung:** Experimentelle Tasks für Lernzwecke
- **Ideal für:** Prototyping, Skill-Entwicklung, Innovationsprojekte

**Beispiel:**
```javascript
// Konservatives Team für kritische Infrastruktur
const criticalTeam = new Team({
  name: 'Infrastructure Team',
  agents: [sysAdmin, securityExpert],
  tasks: [],
  enableOrchestration: true,
  mode: 'conservative',
  availableTasks: securityTasks
});

// Innovatives Team für neue Features
const innovationTeam = new Team({
  name: 'Innovation Lab',
  agents: [researcher, prototyper],
  tasks: [],
  enableOrchestration: true,
  mode: 'innovative',
  allowTaskGeneration: true
});
```

---

### `maxActiveTasks?: number`
**Default:** `5`  
**Typ:** Number (optional)

**Beschreibung:**
Begrenzt die maximale Anzahl von Tasks, die gleichzeitig aktiv sein können.

**Effekt:**
- Verhindert Überlastung des Teams
- Steuert Parallelität des Workflows
- Beeinflusst Task-Auswahl des Orchestrators

**Beispiel:**
```javascript
// Kleines Team mit begrenzter Kapazität
const smallTeam = new Team({
  name: 'Startup Team',
  agents: [fullStackDev],
  tasks: [],
  enableOrchestration: true,
  maxActiveTasks: 2, // Nur 2 Tasks gleichzeitig
  availableTasks: startupTasks
});

// Großes Team mit hoher Parallelität
const enterpriseTeam = new Team({
  name: 'Enterprise Team',
  agents: [dev1, dev2, dev3, tester1, tester2],
  tasks: [],
  enableOrchestration: true,
  maxActiveTasks: 8, // Bis zu 8 parallele Tasks
  availableTasks: enterpriseTasks
});
```

**Empfehlung:** 
- 1-2 Tasks pro Agent als Richtwert
- Berücksichtige Task-Komplexität und Abhängigkeiten

---

### `taskPrioritization?: 'static' | 'dynamic' | 'ai-driven'`
**Default:** `'dynamic'`  
**Typ:** Enum (optional)

**Beschreibung:**
Bestimmt wie Tasks priorisiert werden.

**Strategien im Detail:**

#### `'static'`
- **Verhalten:** Feste Prioritätsreihenfolge basierend auf Abhängigkeiten
- **Anpassung:** Keine Änderung während der Ausführung
- **Ideal für:** Vorhersagbare Workflows, feste Pläne

#### `'dynamic'`
- **Verhalten:** Prioritätsanpassung basierend auf Projektphase und Kontext
- **Anpassung:** Moderate Anpassungen basierend auf Projektfortschritt
- **Ideal für:** Meiste Entwicklungsprojekte

#### `'ai-driven'`
- **Verhalten:** LLM-basierte Prioritätsoptimierung basierend auf Projektzielen
- **Anpassung:** Kontinuierliche Neubewertung durch KI
- **Ideal für:** Komplexe Projekte, adaptive Workflows

**Beispiel:**
```javascript
const team = new Team({
  name: 'AI-Optimized Team',
  agents: [developer, designer, tester],
  tasks: [],
  enableOrchestration: true,
  taskPrioritization: 'ai-driven', // KI entscheidet Prioritäten
  orchestrationStrategy: 'Optimiere für Time-to-Market und Qualität',
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4o'
  }
});
```

---

### `workloadDistribution?: 'balanced' | 'skills-based' | 'availability'`
**Default:** `'balanced'`  
**Typ:** Enum (optional)

**Beschreibung:**
Steuert wie Tasks auf verfügbare Agents verteilt werden.

**Verteilungsstrategien:**

#### `'balanced'`
- **Verhalten:** Gleichmäßige Verteilung über alle verfügbaren Agents
- **Ziel:** Ausgewogene Arbeitsbelastung
- **Ideal für:** Teams mit ähnlichen Fähigkeiten

#### `'skills-based'`
- **Verhalten:** Optimale Zuordnung von Tasks zu Agent-Fähigkeiten
- **Ziel:** Maximale Effizienz durch Expertise-Matching
- **Ideal für:** Spezialisierte Teams, komplexe Projekte

#### `'availability'`
- **Verhalten:** Priorität für Agents mit geringerer aktueller Arbeitsbelastung
- **Ziel:** Schnelle Task-Bearbeitung
- **Ideal für:** Zeitkritische Projekte

**Beispiel:**
```javascript
// Skills-basierte Verteilung für spezialisiertes Team
const specializedTeam = new Team({
  name: 'Specialized Development Team',
  agents: [
    frontendExpert,    // Spezialist für UI/UX
    backendExpert,     // Spezialist für APIs/Datenbank
    securityExpert,    // Spezialist für Sicherheit
    devopsExpert       // Spezialist für Deployment
  ],
  tasks: [],
  enableOrchestration: true,
  workloadDistribution: 'skills-based', // Matching nach Expertise
  availableTasks: specializedTasks
});
```

---

### `adaptationInterval?: number`
**Default:** `300000` (5 Minuten)  
**Typ:** Number in Millisekunden (optional)

**Beschreibung:**
Definiert wie oft der Orchestrator die Workflow-Performance überprüft und Optimierungen vornimmt.

**Effekt:**
- Häufigere Intervalle = Responsivere Anpassungen, höhere LLM-Kosten
- Längere Intervalle = Stabilere Ausführung, niedrigere Kosten

**Beispiel:**
```javascript
// Hochfrequente Optimierung für kritische Projekte
const criticalProject = new Team({
  name: 'Critical Launch Team',
  agents: [developer, tester, manager],
  tasks: [],
  enableOrchestration: true,
  adaptationInterval: 60000, // Jede Minute (60 Sekunden)
  availableTasks: criticalTasks
});

// Seltene Optimierung für stabile Projekte
const stableProject = new Team({
  name: 'Maintenance Team',
  agents: [developer],
  tasks: [],
  enableOrchestration: true,
  adaptationInterval: 1800000, // Alle 30 Minuten
  availableTasks: maintenanceTasks
});
```

**Empfehlung:**
- Entwicklung: 5-15 Minuten
- Produktion: 30-60 Minuten
- Kritische Systeme: 1-5 Minuten

---

### `llmConfig?: LLMConfig`
**Default:** `undefined`  
**Typ:** LLMConfig-Objekt (optional)

**Beschreibung:**
Team-spezifische LLM-Konfiguration für Orchestration-Entscheidungen.

**Effekt:**
- Ermöglicht separates LLM für Orchestration (unabhängig von Agent-LLMs)
- Unterstützt alle KaibanJS-LLM-Provider

**Beispiel:**
```javascript
const team = new Team({
  name: 'AI-Powered Team',
  agents: [developer, tester], // Können andere LLMs verwenden
  tasks: [],
  enableOrchestration: true,
  llmConfig: {
    provider: 'openai',
    model: 'gpt-4o',           // Leistungsstarkes Modell für Orchestration
    temperature: 0.2,          // Niedrige Temperatur für konsistente Entscheidungen
    maxRetries: 3
  },
  availableTasks: complexTasks
});
```

---

### `llmInstance?: LangChainChatModel`
**Default:** `undefined`  
**Typ:** LangChain ChatModel (optional)

**Beschreibung:**
Vorkonfigurierte LLM-Instanz für erweiterte Kontrolle über Orchestration-LLM.

**Beispiel:**
```javascript
import { ChatOpenAI } from 'langchain/chat_models/openai';

const customLLM = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.1,
  maxTokens: 2000,
  // Erweiterte Konfiguration...
});

const team = new Team({
  name: 'Custom LLM Team',
  agents: [developer],
  tasks: [],
  enableOrchestration: true,
  llmInstance: customLLM, // Vorkonfigurierte Instanz
  availableTasks: tasks
});
```

---

## 🎯 Task Properties (ITaskParams)

### `adaptable?: boolean`
**Default:** `false`  
**Typ:** Boolean (optional)

**Beschreibung:**
Erlaubt dem Orchestrator, diesen Task zur Laufzeit zu modifizieren.

**Effekt:**
- `true`: Task kann angepasst werden (Beschreibung, Agent, Umfang)
- `false`: Task ist unveränderlich

**Beispiel:**
```javascript
// Anpassbarer Task für flexible Anforderungen
const flexibleTask = new Task({
  description: 'Implementiere Benutzerauthentifizierung',
  expectedOutput: 'Auth-System',
  agent: developer,
  adaptable: true, // Kann angepasst werden
  orchestrationRules: 'Kann für OAuth, JWT oder Session-based angepasst werden'
});

// Kritischer unveränderlicher Task
const criticalTask = new Task({
  description: 'Sicherheitsaudit durchführen',
  expectedOutput: 'Auditbericht',
  agent: securityExpert,
  adaptable: false, // NICHT veränderbar
  orchestrationRules: 'KRITISCH - Keine Modifikationen erlaubt'
});
```

---

### `orchestrationRules?: string`
**Default:** `undefined`  
**Typ:** String (optional)

**Beschreibung:**
Spezifische Regeln und Einschränkungen für diesen Task, die der Orchestrator beachten muss.

**Beispiel:**
```javascript
const task = new Task({
  description: 'Implementiere Zahlungssystem',
  expectedOutput: 'Sicheres Zahlungssystem',
  agent: developer,
  adaptable: true,
  orchestrationRules: `
    SICHERHEITSREGELN:
    - PCI DSS Compliance erforderlich
    - Keine Kreditkartendaten lokal speichern
    - End-to-End Verschlüsselung obligatorisch
    
    ANPASSUNGSOPTIONEN:
    - Provider kann gewählt werden (Stripe, PayPal)
    - Währungsunterstützung anpassbar
    - Mobile Payment optional
    
    EINSCHRÄNKUNGEN:
    - Keine experimentellen Payment-APIs
    - Audit durch Security-Team erforderlich
  `
});
```

---

### `dynamicPriority?: boolean`
**Default:** `false`  
**Typ:** Boolean (optional)

**Beschreibung:**
Erlaubt dem Orchestrator, die Priorität dieses Tasks dynamisch anzupassen.

**Beispiel:**
```javascript
const adaptiveTask = new Task({
  description: 'Optimiere Datenbankperformance',
  expectedOutput: 'Verbesserte DB-Performance',
  agent: dba,
  dynamicPriority: true, // Priorität kann sich ändern
  orchestrationRules: 'Priorität steigt wenn Performance-Probleme auftreten'
});
```

---

### `splitStrategy?: 'none' | 'manual' | 'auto'`
**Default:** `'none'`  
**Typ:** Enum (optional)

**Beschreibung:**
Definiert ob und wie ein Task in kleinere Tasks aufgeteilt werden kann.

**Strategien:**
- `'none'`: Task bleibt ungeteilt
- `'manual'`: Aufteilung nur bei expliziter Anfrage
- `'auto'`: Orchestrator kann automatisch aufteilen

**Beispiel:**
```javascript
const complexTask = new Task({
  description: 'Erstelle vollständige E-Commerce Plattform',
  expectedOutput: 'Funktionsfähige E-Commerce Website',
  agent: developer,
  splitStrategy: 'auto', // Kann automatisch aufgeteilt werden
  orchestrationRules: 'Aufteilen in: Frontend, Backend, Payment, Admin-Panel'
});
```

---

### `mergeCompatible?: string[]`
**Default:** `[]`  
**Typ:** Array von Task-IDs (optional)

**Beschreibung:**
Liste von Task-IDs, mit denen dieser Task zusammengeführt werden kann.

**Beispiel:**
```javascript
const uiTask = new Task({
  description: 'Erstelle Login-UI',
  expectedOutput: 'Login-Interface',
  agent: frontendDev,
  mergeCompatible: ['register-ui-task', 'profile-ui-task'] // Kompatible UI-Tasks
});
```

---

### `resourceRequirements?: object`
**Default:** `undefined`  
**Typ:** Objekt (optional)

**Beschreibung:**
Detaillierte Informationen über benötigte Ressourcen für diesen Task.

**Struktur:**
```typescript
{
  estimatedTime?: string;      // Geschätzte Bearbeitungszeit
  skillsRequired?: string[];   // Erforderliche Fähigkeiten
  dependencies?: string[];     // Task-Abhängigkeiten
}
```

**Beispiel:**
```javascript
const complexTask = new Task({
  description: 'Implementiere Microservice-Architektur',
  expectedOutput: 'Microservice-System',
  agent: architect,
  resourceRequirements: {
    estimatedTime: '2-3 Wochen',
    skillsRequired: [
      'microservices',
      'docker',
      'kubernetes',
      'api_design',
      'system_architecture'
    ],
    dependencies: [
      'database_design',
      'infrastructure_setup',
      'security_framework'
    ]
  }
});
```

---

### `template?: boolean`
**Default:** `false`  
**Typ:** Boolean (optional)

**Beschreibung:**
Markiert den Task als wiederverwendbare Vorlage für das `availableTasks` Repository.

**Beispiel:**
```javascript
const templateTask = new Task({
  description: 'Implementiere CRUD-Operations für {entity}',
  expectedOutput: 'Vollständige CRUD-API für {entity}',
  agent: backendDev,
  template: true, // Wiederverwendbare Vorlage
  adaptable: true, // Kann für verschiedene Entities angepasst werden
  resourceRequirements: {
    estimatedTime: '1-2 Tage',
    skillsRequired: ['backend', 'database', 'api_design']
  }
});
```

---

## 💡 Property-Interaktionen und Best Practices

### Empfohlene Kombinationen

#### Konservatives Setup
```javascript
const conservativeTeam = new Team({
  name: 'Production Team',
  agents: [seniorDev, tester],
  tasks: [],
  enableOrchestration: true,
  mode: 'conservative',
  taskPrioritization: 'static',
  workloadDistribution: 'balanced',
  maxActiveTasks: 3,
  allowTaskGeneration: false
});
```

#### Innovatives Setup
```javascript
const innovativeTeam = new Team({
  name: 'R&D Team',
  agents: [researcher, prototyper],
  tasks: [],
  enableOrchestration: true,
  mode: 'innovative',
  taskPrioritization: 'ai-driven',
  workloadDistribution: 'skills-based',
  maxActiveTasks: 5,
  allowTaskGeneration: true,
  adaptationInterval: 120000
});
```

### Häufige Anwendungsfälle

1. **Agile Entwicklung:** `mode: 'adaptive'`, `taskPrioritization: 'dynamic'`
2. **Kritische Systeme:** `mode: 'conservative'`, `allowTaskGeneration: false`
3. **Forschung:** `mode: 'learning'`, `allowTaskGeneration: true`
4. **Wartung:** Längere `adaptationInterval`, `mode: 'conservative'`

### Troubleshooting

**Problem:** Orchestration funktioniert nicht  
**Lösung:** Prüfe ob `enableOrchestration: true` gesetzt ist

**Problem:** Zu viele Tasks generiert  
**Lösung:** Setze `allowTaskGeneration: false` oder präzisiere `orchestrationStrategy`

**Problem:** Schlechte Task-Zuordnung  
**Lösung:** Wechsle zu `workloadDistribution: 'skills-based'`

**Problem:** Hohe LLM-Kosten  
**Lösung:** Erhöhe `adaptationInterval`, verwende `mode: 'conservative'`