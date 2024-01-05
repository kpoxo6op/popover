"use client";
import React, { useState } from "react";
import { isSameDay } from "date-fns";
import "react-day-picker/dist/style.css";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";

import { DayClickEventHandler, DateRange, DayPicker, DayProps, useDayRender } from "react-day-picker";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

const EntrySchema = z.object({
  overtime: z.string().min(1, "Overtime is required"),
  notes: z.string().min(1, "Notes are required"),
});

type Entry = z.infer<typeof EntrySchema> & { date: Date };

function DayWithShiftKey(
  props: DayProps & { onEntrySubmit: (entry: Entry) => void }
) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dayRender = useDayRender(props.date, props.displayMonth, buttonRef);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Entry>({
    resolver: zodResolver(EntrySchema),
  });

  const onSubmit = (data: Entry) => {
    props.onEntrySubmit({ ...data, date: props.date });
    reset();
  };

  if (dayRender.isHidden) {
    return <></>;
  }
  if (!dayRender.isButton) {
    return <div {...dayRender.divProps} />;
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (
      !dayRender.selectedDays ||
      dayRender.activeModifiers.selected ||
      e.shiftKey
    ) {
      // dayRender.buttonProps?.onClick?.(e);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button {...dayRender.buttonProps} ref={buttonRef} onClick={handleClick} />
      </PopoverTrigger>
      <PopoverContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>Selected Date: {props.date.toLocaleDateString()}</div>
          <input {...register("overtime")} placeholder="Overtime Hours" />
          {errors.overtime && <span>{errors.overtime.message}</span>}
          <textarea {...register("notes")} placeholder="Notes" />
          {errors.notes && <span>{errors.notes.message}</span>}
          <Button type="submit">Submit</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
}

function Timesheet({ entries }: { entries: Entry[] }) {
  return (
    <div>
      {entries.map((entry, index) => (
        <div key={index}>
          <p>Date: {entry.date.toLocaleDateString()}</p>
          <p>Overtime Hours: {entry.overtime}</p>
          <p>Notes: {entry.notes}</p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
    const [entries, setEntries] = useState<Entry[]>([]);
  const handleNewEntry = (entry: Entry) => {
    setEntries((prev) => [...prev, entry]);
  };

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    if (!modifiers.selected) {
      setSelectedDay(day);
    } else {
      setSelectedDay(undefined); // Deselect the day
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <DayPicker
          components={{
            Day: (props) => (
              <DayWithShiftKey {...props} onEntrySubmit={handleNewEntry} />
            ),
          }}
          mode="single"
          onDayClick={handleDayClick}
          selected={selectedDay}
          footer={<p>{selectedDay ? `Selected date: ${selectedDay.toLocaleDateString()}` : 'Please pick a day.'}</p>}
        />
        <Timesheet entries={entries} />
      </div>
    </main>
  );
}
