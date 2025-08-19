import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, FileText, Plus, X } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';

interface ImportDialogProps {
  onClose: () => void;
  onImport: (prospects: any[]) => void;
}

export function ImportDialog({ onClose, onImport }: ImportDialogProps) {
  const [csvText, setCsvText] = useState('');
  const [manualProspects, setManualProspects] = useState([
    { name: '', email: '', company: '', owner: '', notes: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addManualProspect = () => {
    setManualProspects([...manualProspects, { name: '', email: '', company: '', owner: '', notes: '' }]);
  };

  const updateManualProspect = (index: number, field: string, value: string) => {
    const updated = [...manualProspects];
    updated[index] = { ...updated[index], [field]: value };
    setManualProspects(updated);
  };

  const removeManualProspect = (index: number) => {
    setManualProspects(manualProspects.filter((_, i) => i !== index));
  };

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredFields = ['name', 'email'];
    
    for (const field of requiredFields) {
      if (!headers.includes(field)) {
        throw new Error(`CSV must include ${field} column`);
      }
    }

    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const prospect: any = {};
      
      headers.forEach((header, index) => {
        prospect[header] = values[index] || '';
      });

      // Set defaults for missing fields
      if (!prospect.company) prospect.company = 'Unknown';
      if (!prospect.owner) prospect.owner = 'Unassigned';
      if (!prospect.notes) prospect.notes = '';
      if (!prospect.timezone) prospect.timezone = 'America/New_York';

      return prospect;
    });
  };

  const handleCsvImport = async () => {
    if (!csvText.trim()) {
      setError('Please enter CSV data');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const prospects = parseCsv(csvText);
      await onImport(prospects);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualImport = async () => {
    const validProspects = manualProspects.filter(p => p.name && p.email);
    
    if (validProspects.length === 0) {
      setError('Please enter at least one prospect with name and email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const prospects = validProspects.map(p => ({
        ...p,
        company: p.company || 'Unknown',
        owner: p.owner || 'Unassigned',
        timezone: 'America/New_York'
      }));
      
      await onImport(prospects);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Import Prospects</DialogTitle>
          <DialogDescription>
            Add prospects to your outreach sequence via CSV upload or manual entry
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="csv" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="csv" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              CSV Import
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="csv" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-data">CSV Data</Label>
              <Textarea
                id="csv-data"
                placeholder="name,email,company,owner,notes
John Doe,john@example.com,Example Corp,Jane Smith,Interested in our product
Jane Smith,jane@company.com,Another Co,John Doe,Follow up needed"
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-sm text-muted-foreground">
                Required columns: name, email. Optional: company, owner, notes, timezone
              </p>
            </div>

            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription>
                <strong>CSV Format:</strong> Use comma-separated values with headers in the first row. 
                Make sure to include "name" and "email" columns at minimum.
              </AlertDescription>
            </Alert>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCsvImport} disabled={loading}>
                {loading ? 'Importing...' : 'Import CSV'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-4 max-h-96 overflow-auto">
              {manualProspects.map((prospect, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Prospect {index + 1}</h4>
                    {manualProspects.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeManualProspect(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`name-${index}`}>Name *</Label>
                      <Input
                        id={`name-${index}`}
                        value={prospect.name}
                        onChange={(e) => updateManualProspect(index, 'name', e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`email-${index}`}>Email *</Label>
                      <Input
                        id={`email-${index}`}
                        type="email"
                        value={prospect.email}
                        onChange={(e) => updateManualProspect(index, 'email', e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`company-${index}`}>Company</Label>
                      <Input
                        id={`company-${index}`}
                        value={prospect.company}
                        onChange={(e) => updateManualProspect(index, 'company', e.target.value)}
                        placeholder="Example Corp"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`owner-${index}`}>Owner</Label>
                      <Input
                        id={`owner-${index}`}
                        value={prospect.owner}
                        onChange={(e) => updateManualProspect(index, 'owner', e.target.value)}
                        placeholder="Jane Smith"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`notes-${index}`}>Notes</Label>
                    <Textarea
                      id={`notes-${index}`}
                      value={prospect.notes}
                      onChange={(e) => updateManualProspect(index, 'notes', e.target.value)}
                      placeholder="Any additional notes about this prospect..."
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={addManualProspect}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Prospect
            </Button>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleManualImport} disabled={loading}>
                {loading ? 'Importing...' : `Import ${manualProspects.filter(p => p.name && p.email).length} Prospects`}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}