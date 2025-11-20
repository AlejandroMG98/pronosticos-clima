export interface Tab {
  id: string;
  title: string;
  active: boolean;
  closable: boolean;
  content?: any;
}
