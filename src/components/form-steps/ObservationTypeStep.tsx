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

export function ObservationTypeStep() {
  const { formData, setFormData } = useActivityForm();

  const handleObservationTypeChange = useCallback((type: 'direct' | 'indirect' | 'loss') => {
    setFormData({
      ...formData,
      observation_type: type,
      // Reset fields from other observation types
      total_elephants: undefined,
      male_elephants: undefined,
      female_elephants: undefined,
      unknown_elephants: undefined,
      calves: undefined,
      indirect_sighting_type: undefined,
      loss_type: undefined,
    });
  }, [formData, setFormData]);

  // Debounced handlers for number inputs
  const debouncedSetFormData = useMemo(
    () => debounce((updates: Partial<typeof formData>) => {
      setFormData(updates);
    }, 300),
    [setFormData]
  );

  const handleNumberChange = useCallback((field: string, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0) {
      debouncedSetFormData({ [field]: num });
    }
  }, [debouncedSetFormData]);

  const handleSelectChange = useCallback((field: string, value: string) => {
    setFormData({ [field]: value });
  }, [setFormData]);

  return (
    <div className="space-y-6">
      <RadioGroup
        value={formData.observation_type}
        onValueChange={(value: 'direct' | 'indirect' | 'loss') => handleObservationTypeChange(value)}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Label
          htmlFor="direct"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
            ${formData.observation_type === 'direct' ? 'border-green-600 bg-green-50' : 'border-gray-200'}
          `}
        >
          <RadioGroupItem value="direct" id="direct" className="sr-only" />
          <span className="text-lg font-semibold">Direct Sighting</span>
        </Label>

        <Label
          htmlFor="indirect"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
            ${formData.observation_type === 'indirect' ? 'border-green-600 bg-green-50' : 'border-gray-200'}
          `}
        >
          <RadioGroupItem value="indirect" id="indirect" className="sr-only" />
          <span className="text-lg font-semibold">Indirect Sighting</span>
        </Label>

        <Label
          htmlFor="loss"
          className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 cursor-pointer
            ${formData.observation_type === 'loss' ? 'border-green-600 bg-green-50' : 'border-gray-200'}
          `}
        >
          <RadioGroupItem value="loss" id="loss" className="sr-only" />
          <span className="text-lg font-semibold">Loss by Elephant</span>
        </Label>
      </RadioGroup>

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
              <StepperSelect
                value={formData.indirect_sighting_type}
                onChange={value => handleSelectChange('indirect_sighting_type', value)}
                options={[
                  { value: "Pugmark", label: "Pugmark" },
                  { value: "Dung", label: "Dung" },
                  { value: "Broken Branches", label: "Broken Branches" },
                  { value: "Sound", label: "Sound" },
                  { value: "Eyewitness", label: "Eyewitness" },
                ]}
                placeholder="Select type of indirect sighting"
                className="w-full h-12 text-base"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {formData.observation_type === 'loss' && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <Label htmlFor="loss_type">Type of Loss</Label>
              <StepperSelect
                value={formData.loss_type}
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
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 