"use client";

import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function AddressStartPointForm({
  onSubmit,
  errorMessage,
}: {
  onSubmit: (address: string) => void;
  errorMessage?: string;
}) {
  const [address, setAddress] = useState("");

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(address);
      }}
    >
      <Field data-invalid={!!errorMessage}>
        <FieldLabel htmlFor="start-address">출발 지점 주소</FieldLabel>
        <Input
          id="start-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          aria-invalid={!!errorMessage}
          placeholder="예: 김해시 분성로 100"
        />
        <FieldDescription>
          현재 위치를 사용할 수 없어요. 김해시 내 주소를 입력해 주세요.
        </FieldDescription>
      </Field>
      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={address.trim().length === 0}>
        주소로 출발 지점 지정
      </Button>
    </form>
  );
}
