import { createFileRoute } from "@tanstack/react-router";
import { actions, useStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Plus, Trash2, Users } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/contacts")({
  head: () => ({ meta: [{ title: "Contacts — WA Campaign Manager" }] }),
  component: ContactsPage,
});

function ContactsPage() {
  const contacts = useStore((s) => s.draft.contacts);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="text-sm text-muted-foreground">Shared with your active campaign draft.</p>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Plus className="h-4 w-4" /> Add contact
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Phone with country code" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button
            onClick={() => {
              if (!name.trim() || !phone.trim()) return;
              actions.addContact({ name: name.trim(), phone: phone.replace(/\D/g, "") });
              setName(""); setPhone("");
            }}
            className="bg-primary text-primary-foreground hover:opacity-90"
          >
            Add
          </Button>
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display">
            <Users className="h-4 w-4" /> All contacts ({contacts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No contacts yet. Add some above or import in Campaign Builder.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="font-mono">+{c.phone}</TableCell>
                    <TableCell className="capitalize text-muted-foreground">{c.status}</TableCell>
                    <TableCell>
                      <Button size="icon" variant="ghost" onClick={() => actions.removeContact(c.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
