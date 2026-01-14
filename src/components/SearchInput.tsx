import { ActionIcon, TextInput, type TextInputProps } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface SearchInputProps extends Omit<TextInputProps, 'onChange'> {
  onSearch: (value: string) => void;
  debounceMs?: number;
  initialValue?: string;
}

const SearchInput = ({
  onSearch,
  debounceMs = 300,
  initialValue = '',
  placeholder = 'Search...',
  ...props
}: SearchInputProps) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue] = useDebouncedValue(value, debounceMs);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  const handleClear = () => {
    setValue('');
  };

  return (
    <TextInput
      {...props}
      leftSection={<IconSearch aria-hidden="true" size={18} />}
      placeholder={placeholder}
      rightSection={
        value ? (
          <ActionIcon
            aria-label="Clear search"
            size="sm"
            variant="subtle"
            onClick={handleClear}
          >
            <IconX size={16} />
          </ActionIcon>
        ) : undefined
      }
      value={value}
      onChange={(event) => setValue(event.currentTarget.value)}
    />
  );
};

export default SearchInput;
