export interface IGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  features: string[];
}
