import { FocusOption } from "./types";

export interface DemoPreset {
  id: string;
  title: string;
  subject: string;
  icon: string;
  option: FocusOption;
  content: string;
}

export const DEMO_PRESETS: DemoPreset[] = [
  {
    id: "biology-cells",
    title: "Cellular Energy & ATP Synthesis",
    subject: "Biology",
    icon: "Dna",
    option: "standard",
    content: `Cellular respiration is the process by which cells convert biochemical energy from nutrients into adenosine triphosphate (ATP), and then release waste products. The reactions involved in respiration are catabolic reactions, which break large molecules into smaller ones, releasing energy because weak high-energy bonds are replaced by stronger bonds in the products.

Respiration is one of the key ways a cell gains useful energy to fuel cellular activity. The overall reaction occurs in a series of biophysical steps:
C6H12O6 + 6O2 ---> 6CO2 + 6H2O + Metabolic Heat (approx. 36-38 ATP molecules)

Aerobic respiration requires oxygen (O2) in order to create ATP. Although carbohydrates, amino acids, and fatty acids are commonly oxidized, it is the highly studied metabolic pathway of glycolysis followed by the Krebs cycle (Citric Acid Cycle) and oxidative phosphorylation that occurs in the mitochondria.

1. Glycolysis: Occurs in the cytoplasm. It is an anaerobic process that splits one glucose molecule (a 6-carbon sugar) into two molecules of pyruvate (a 3-carbon compound), generating a net of 2 ATP molecules and 2 NADH molecules.

2. Inside the Mitochondria (Krebs Cycle): Under aerobic conditions, pyruvate enters the mitochondrial matrix where it is converted into Acetyl-CoA. This reactant is fed into the Citric Acid Cycle, which regenerates oxaloacetate while producing 2 ATP, 6 NADH, and 2 FADH2 molecules per glucose molecule, releasing CO2 as a byproduct.

3. Oxidative Phosphorylation: Takes place on the inner mitochondrial membrane (cristae). High-energy electrons carried by NADH and FADH2 are transferred through the Electron Transport Chain (ETC). The movement of electrons pumps protons (H+) from the mitochondrial matrix into the intermembrane space, creating an electrochemical gradient (proton-motive force). Protons flow back down their gradient through ATP Synthase (a molecular turbine mechanism), catalyzing the phosphorylation of ADP to ATP. This process (chemiosmosis) generates about 32-34 molecules of ATP, with Oxygen serving as the final electron acceptor, combining with protons to form water (H2O).`
  },
  {
    id: "history-ww1",
    title: "The Outbreak of the First World War",
    subject: "History",
    icon: "BookOpen",
    option: "conceptual",
    content: `The outbreak of World War I in Europe in 1914 was triggered by a complex web of long-term systemic issues combined with a critical short-term political crisis. Historians categorize the underlying structural causes using the acronym M-A-I-N:

1. Militarism: Many European powers engaged in a massive arms race in the late 19th and early 20th centuries. Of particular note was the Anglo-German naval race. Germany's push to build a high-seas fleet capable of rivaling Great Britain's Royal Navy created deep defense anxiety and accelerated militarist politics.

2. Alliances: Europe was divided into two rigid, defensive treaty systems. The Triple Entente comprised Great Britain, France, and Russia. The Triple Alliance joined Germany, Austria-Hungary, and Italy (though Italy later changed sides). These alliances meant that a localized conflict could rapidly cascade into a general European conflagration, obligating states to defend allies regardless of original war motives.

3. Imperialism: The 'Scramble for Africa' and competition in Asia fueled intense economic rivalry and colonial disputes. Clashes like the Moroccan Crises (1905 and 1911) repeatedly pushed France, Britain, and Germany to the brink of hostility, building long-term resentment.

4. Nationalism: Rising nationalist fervor asserted national superiority while weakening multi-ethnic empires. In the Balkan peninsula ('the powder keg of Europe'), Slavic nationalism, supported by Russia, actively resisted the colonial influence of the Austro-Hungarian Empire.

The catalyst occurred on June 28, 1914, in Sarajevo, Bosnia. Archduke Franz Ferdinand, heir to the Austro-Hungarian throne, was assassinated by Gavrilo Princip, a Serbian nationalist belonging to the 'Black Hand' secret society. Austria-Hungary blames Serbia and, backed by a German 'blank check' of unconditional support, issued a harsh ultimatum. When Serbia refused key terms, Austria declared war, activating the alliance network. Russia mobilized to protect Serbia, leading Germany to declare war on Russia and France, invading Belgium and drawing Great Britain into the war.`
  },
  {
    id: "cs-databases",
    title: "Database Normalization Theory",
    subject: "Computer Science",
    icon: "Cpu",
    option: "exam-prep",
    content: `Database normalization is a systematic process of organizing fields and tables in a relational database to minimize data redundancy (duplication) and prevent dependency anomalies (insertion, update, and deletion anomalies). The normalization process involves splitting large, general tables into smaller, well-structured tables and defining relationships between them.

The process is governed by rules called Normal Forms, each building sequentially upon the requirements of the former:

- First Normal Form (1NF): Requires that the table contains only atomic (indivisible) values at each intersection of row and column. Repeating groups of columns or multi-valued attributes are strictly forbidden. Every row must be uniquely identifiable by a Primary Key.

- Second Normal Form (2NF): Combines 1NF compliance with the requirement that all non-key columns must look to the whole primary key for their meaning. In other words, there must be no 'partial dependencies' where a non-prime attribute depends on only a subset of a composite primary key. This applies only to tables with composite keys.

- Third Normal Form (3NF): Combines 2NF compliance with the requirement that no non-key columns depend transitively on the primary key. Transitive dependency occurs when A determines B, and B determines C. Therefore, A transitively determines C. In 3NF, every non-key attribute must depend directly, entirely, and only upon the primary key (colloquially summarized by database experts as: 'The key, the whole key, and nothing but the key, so help me Codd').

Anomalies addressed:
1. Insertion Anomaly: Inability to record a fact because other facts are not yet known. (e.g., cannot add a new course if no students are enrolled in it yet).
2. Deletion Anomaly: Unintentional loss of key data when associated records are deleted. (e.g., deleting the only student enrolled in a course deletes all description details of that course).
3. Update Anomaly: Multiple copies of redundant data exist. Updating one requires updating all to avoid inconsistent data values across the database.`
  }
];
