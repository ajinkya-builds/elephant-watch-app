import React, { useCallback, useMemo } from 'react';
import { useActivityForm } from '@/contexts/ActivityFormContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import debounce from 'lodash/debounce';
import { CrossPlatformSelect } from "@/components/ui/CrossPlatformSelect";
import { StepperSelect, OptionType } from "@/components/ui/StepperSelect";
import { isAndroid } from '@/lib/isAndroidWebView';
import { ObservationType, IndirectSightingType, LossType } from '@/types/activity-report';

const observationTypes: { value: ObservationType; label: string }[] = [
  { value: 'direct', label: 'Direct Sighting' },
  { value: 'indirect', label: 'Indirect Sighting' },
  { value: 'loss', label: 'Loss Report' }
];

const indirectSightingTypes: { value: IndirectSightingType; label: string }[] = [
  { value: 'Pugmark', label: 'Pugmark' },
  { value: 'Dung', label: 'Dung' },
  { value: 'Broken Branches', label: 'Broken Branches' },
  { value: 'Sound', label: 'Sound' },
  { value: 'Eyewitness', label: 'Eyewitness' }
];

const lossTypes: { value: LossType; label: string }[] = [
  { value: 'No loss', label: 'No Loss' },
  { value: 'crop', label: 'Crop Damage' },
  { value: 'livestock', label: 'Livestock Loss' },
  { value: 'property', label: 'Property Damage' },
  { value: 'fencing', label: 'Fencing Damage' },
  { value: 'solar panels', label: 'Solar Panel Damage' },
  { value: 'FD establishment', label: 'FD Establishment Damage' },
  { value: 'Other', label: 'Other Loss' }
];

export const ObservationTypeStep: React.FC = () => {
  const { formData, updateFormData } = useActivityForm();

  const handleObservationTypeChange = (value: ObservationType) => {
    updateFormData({ observation_type: value });
  };

  const handleIndirectSightingTypeChange = (value: IndirectSightingType) => {
    updateFormData({ indirect_sighting_type: value });
  };

  const handleLossTypeChange = (value: LossType) => {
    updateFormData({ loss_type: value });
  };

  // Debounced handlers for number inputs
  const debouncedSetFormData = useMemo(
    () => debounce((updates: Partial<typeof formData>) => {
      updateFormData(updates);
    }, 300),
    [updateFormData]
  );

  const handleNumberChange = useCallback((field: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      debouncedSetFormData({ [field]: num });
    }
  }, [debouncedSetFormData]);

  const handleSelectChange = useCallback((field: string, value: string) => {
    updateFormData({ [field]: value });
  }, [updateFormData]);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <Label>Type of Observation</Label>
              <RadioGroup
                value={formData.observation_type}
                onValueChange={handleObservationTypeChange}
                className="mt-2"
              >
                {observationTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value}>{type.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {formData.observation_type === 'indirect' && (
              <div>
                <Label>Indirect Sighting Type</Label>
                <RadioGroup
                  value={formData.indirect_sighting_type}
                  onValueChange={handleIndirectSightingTypeChange}
                  className="mt-2"
                >
                  {indirectSightingTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label htmlFor={type.value}>{type.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {formData.observation_type === 'loss' && (
              <div>
                <Label>Loss Type</Label>
                <RadioGroup
                  value={formData.loss_type}
                  onValueChange={handleLossTypeChange}
                  className="mt-2"
                >
                  {lossTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label htmlFor={type.value}>{type.label}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {formData.observation_type === 'direct' && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="total_elephants">Total Elephants</Label>
                <Input
                  type="number"
                  id="total_elephants"
                  min="0"
                  value={formData.total_elephants || ''}
                  onChange={(e) => handleNumberChange('total_elephants', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="male_elephants">Male Elephants</Label>
                <Input
                  type="number"
                  id="male_elephants"
                  min="0"
                  value={formData.male_elephants || ''}
                  onChange={(e) => handleNumberChange('male_elephants', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="female_elephants">Female Elephants</Label>
                <Input
                  type="number"
                  id="female_elephants"
                  min="0"
                  value={formData.female_elephants || ''}
                  onChange={(e) => handleNumberChange('female_elephants', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unknown_elephants">Unknown Elephants</Label>
                <Input
                  type="number"
                  id="unknown_elephants"
                  min="0"
                  value={formData.unknown_elephants || ''}
                  onChange={(e) => handleNumberChange('unknown_elephants', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calves">Calves</Label>
                <Input
                  type="number"
                  id="calves"
                  min="0"
                  value={formData.calves || ''}
                  onChange={(e) => handleNumberChange('calves', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.observation_type === 'indirect' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="indirect_sighting_type">Type of Indirect Sighting</Label>
              <Select
                value={formData.indirect_sighting_type || ''}
                onValueChange={value => handleSelectChange('indirect_sighting_type', value)}
              >
                <SelectTrigger className="w-full bg-white border-gray-200 shadow-sm hover:border-blue-500 transition-colors">
                  <SelectValue placeholder="Select type of indirect sighting" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pugmark">Pugmark</SelectItem>
                  <SelectItem value="Dung">Dung</SelectItem>
                  <SelectItem value="Broken Branches">Broken Branches</SelectItem>
                  <SelectItem value="Sound">Sound</SelectItem>
                  <SelectItem value="Eyewitness">Eyewitness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {formData.observation_type === 'loss' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="loss_type">Type of Loss</Label>
              {isAndroid() ? (
                <select
                  id="loss_type"
                  value={formData.loss_type ?? undefined}
                  onChange={e => handleSelectChange('loss_type', e.target.value)}
                  className="w-full h-12 text-base border rounded"
                >
                  <option value="">Select type of loss</option>
                  <option value="No loss">No loss</option>
                  <option value="crop">Crop</option>
                  <option value="livestock">Livestock</option>
                  <option value="property">Property</option>
                  <option value="fencing">Fencing</option>
                  <option value="solar panels">Solar Panels</option>
                  <option value="FD establishment">FD Establishment</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <StepperSelect
                  value={formData.loss_type ?? ''}
                  onChange={value => handleSelectChange('loss_type', value)}
                  options={[
                    { value: "No loss", label: "No loss" },
                    { value: "crop", label: "Crop" },
                    { value: "livestock", label: "Livestock" },
                    { value: "property", label: "Property" },
                    { value: "fencing", label: "Fencing" },
                    { value: "solar panels", label: "Solar Panels" },
                    { value: "FD establishment", label: "FD Establishment" },
                    { value: "Other", label: "Other" },
                  ]}
                  placeholder="Select type of loss"
                  className="w-full h-12 text-base"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 