import React, { useState } from 'react';
import { Container, Grid, Card, Text, Title, RingProgress, Button, Center, Slider, Group, Modal, TextInput, Select } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Provider, useDispatch, useSelector } from 'react-redux';

// Types
type WidgetType = 'donut' | 'placeholder' | 'slider';

interface Widget {
  type: WidgetType;
  data?: any;
  title?: string;
}

interface Category {
  name: string;
  widgets: Widget[];
}

interface WidgetsState {
  categories: Category[];
}

// Initial State
const initialState: WidgetsState = {
  categories: [
    {
      name: 'CSPM Executive Dashboard',
      widgets: [
        { type: 'donut', title: 'Cloud Accounts', data: { label: 'Connected', value: 50, total: 2, segments: [{ value: 50, color: 'blue' }, { value: 50, color: 'gray' }] } },
        { type: 'donut', title: 'Cloud Account Risk', data: { label: 'Total', value: 70, total: 9659, segments: [{ value: 20, color: 'red' }, { value: 15, color: 'yellow' }, { value: 5, color: 'orange' }, { value: 30, color: 'green' }] } },
      ],
    },
    {
      name: 'CWPP Dashboard',
      widgets: [
        { type: 'placeholder', title: 'Top 5 Namespace Specific Alerts', data: 'Top 5 Namespace Specific Alerts' },
        { type: 'placeholder', title: 'Workload Alerts', data: 'Workload Alerts' },
      ],
    },
    {
      name: 'Registry Scan',
      widgets: [
        { type: 'slider', title: 'Image Risk Assessment', data: { label: 'Critical', value: 50, max: 1470, color: 'red' } },
        { type: 'slider', title: 'Image Security Issues', data: { label: 'High', value: 60, max: 2, color: 'orange' } },
      ],
    },
  ],
};

// Redux Slice
const widgetsSlice = createSlice({
  name: 'widgets',
  initialState,
  reducers: {
    addWidget(state, action: PayloadAction<{ categoryIndex: number; widget: Widget }>) {
      state.categories[action.payload.categoryIndex].widgets.splice(2, 0, action.payload.widget);
    },
    removeWidget(state, action: PayloadAction<{ categoryIndex: number; widgetIndex: number }>) {
      state.categories[action.payload.categoryIndex].widgets.splice(action.payload.widgetIndex, 1);
    },
  },
});

const { addWidget, removeWidget } = widgetsSlice.actions;
const store = configureStore({
  reducer: {
    widgets: widgetsSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Main Dashboard Component
function Assignment() {
  const categories = useSelector((state: RootState) => state.widgets.categories);
  const dispatch = useDispatch<AppDispatch>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number | null>(null);
  const [newWidget, setNewWidget] = useState<{ type: WidgetType; title: string; data: any }>({
    type: 'donut',
    title: '',
    data: {},
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddWidget = () => {
    if (currentCategoryIndex !== null) {
      if (newWidget.type === 'donut') {
        newWidget.data = {
          label: 'New Data',
          value: 0,
          total: 100,
          segments: [{ value: 50, color: 'blue' }, { value: 50, color: 'gray' }],
        };
      } else if (newWidget.type === 'slider') {
        newWidget.data = {
          label: 'New Slider',
          value: 0,
          max: 100,
          color: 'blue',
        };
      } else if (newWidget.type === 'placeholder') {
        newWidget.data = 'No data';
      }
      dispatch(addWidget({ categoryIndex: currentCategoryIndex, widget: newWidget }));
      setNewWidget({ type: 'donut', title: '', data: {} });
      setIsModalOpen(false);
      setCurrentCategoryIndex(null); // Clear the selected category
    }
  };

  const handleRemoveWidget = (categoryIndex: number, widgetIndex: number) => {
    dispatch(removeWidget({ categoryIndex, widgetIndex }));
  };

  // Filter widgets based on search term
  const filteredCategories = categories.map((category) => ({
    ...category,
    widgets: category.widgets.filter((widget) =>
      widget.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  }));

  return (
    <Container>
      <Group position="apart" mb="lg">
        <Title order={1}>CSPM Dashboard</Title>
        <Group>
          <Button variant="light" leftIcon={<IconPlus size={16} />} onClick={() => setIsModalOpen(true)}>
            Add Widget
          </Button>
          <TextInput
            placeholder="Search widgets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Group>
      </Group>

      {filteredCategories.map((category, catIdx) => (
        <div key={catIdx}>
          <Title order={2} my="lg">{category.name}</Title>
          <Grid>
            {category.widgets.map((widget, widgetIdx) => (
              <Grid.Col key={widgetIdx} span={4}>
                <Card shadow="sm" p="lg" style={{ height: '180px' }}>
                  <Group position="apart">
                    <Title order={4} style={{ marginBottom: '1rem' }}>{widget.title}</Title>
                    <Button variant="subtle" color="red" size="xs" onClick={() => handleRemoveWidget(catIdx, widgetIdx)}><IconTrash size={16} /></Button>
                  </Group>
                  {widget.type === 'donut' && (
                    <div style={{ textAlign: 'center' }}>
                      <RingProgress
                        sections={widget.data.segments}
                        label={
                          <Text size="xs" align="center">
                            {widget.data.label} ({widget.data.total})
                          </Text>
                        }
                      />
                      <Text mt="xs" size="lg">
                        {widget.data.total}
                      </Text>
                    </div>
                  )}
                  {widget.type === 'placeholder' && (
                    <Center style={{ height: '100%' }}>
                      <Text>No Graph data available!</Text>
                    </Center>
                  )}
                  {widget.type === 'slider' && (
                    <div>
                      <Text>{widget.data.label}</Text>
                      <Slider
                        value={widget.data.value}
                        max={widget.data.max}
                        color={widget.data.color}
                        marks={[{ value: widget.data.value, label: `${widget.data.value}` }]}
                      />
                    </div>
                  )}
                </Card>
              </Grid.Col>
            ))}
            {/* Always show the "Add Widget" button at the third position */}
            <Grid.Col span={4}>
              <Card shadow="sm" p="lg" style={{ height: '180px' }}>
                <Center style={{ height: '100%' }}>
                  <Button
                    variant="light"
                    leftIcon={<IconPlus size={16} />}
                    onClick={() => {
                      setCurrentCategoryIndex(catIdx);
                      setIsModalOpen(true);
                    }}
                  >
                    Add Widget
                  </Button>
                </Center>
              </Card>
            </Grid.Col>
          </Grid>
        </div>
      ))}

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Widget"
      >
        <Select
          label="Select Category"
          value={currentCategoryIndex !== null ? currentCategoryIndex.toString() : ''}
          onChange={(value) => setCurrentCategoryIndex(Number(value))}
          data={categories.map((cat, index) => ({ value: index.toString(), label: cat.name }))}
          mb="sm"
        />
        <TextInput
          label="Widget Title"
          value={newWidget.title}
          onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
          mb="sm"
        />
        <Select
          label="Widget Type"
          value={newWidget.type}
          onChange={(value) => setNewWidget({ ...newWidget, type: value as WidgetType })}
          data={[
            { value: 'donut', label: 'Donut Chart' },
            { value: 'placeholder', label: 'Placeholder' },
            { value: 'slider', label: 'Slider' },
          ]}
          mb="sm"
        />
        <Button onClick={handleAddWidget}>Add Widget</Button>
      </Modal>
    </Container>
  );
}

// Wrap the component with Redux provider
export default function WrappedAssignment() {
  return (
    <Provider store={store}>
      <Assignment />
    </Provider>
  );
}
