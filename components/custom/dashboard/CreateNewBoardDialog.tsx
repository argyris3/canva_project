import React, { useState } from 'react'
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast'
import axios from 'axios'
import { useRouter } from 'next/navigation'
function CreateNewBoardDialog() {

    const [workspaceName, setWorkspaceName] = useState("");
    const [loading, setLoading] = useState(false);
    const [dialog, setDialog] = useState(false);
    const route = useRouter();
    const handleCreateBoard = async () => {
        // Keep board names short enough to fit dashboard cards and workspace headers.
        if (workspaceName.trim() === "" || workspaceName?.length > 30) {
            toast.add({
                type: "error",
                title: "Invalid Workspace Name",
                description: "Please enter a valid workspace name (1-30 characters).",
            })

            return;
        }
        setLoading(true);
        // The client creates the public project id so it can route immediately after a successful insert.
        const projectId = crypto.randomUUID();
        try {
            await axios.post('/api/projects', {
                projectName: workspaceName,
                projectId: projectId
            });

            toast.add({
                type: 'success',
                title: 'New Workspace Created'
            });
            setDialog(false);
            route.push('/workspace/' + projectId)
        } catch (error) {
            const description = axios.isAxiosError(error) &&
                typeof error.response?.data?.error === 'string'
                ? error.response.data.error
                : 'Please try again.';

            toast.add({
                type: 'error',
                title: "Couldn't Create Board",
                description
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={dialog} onOpenChange={setDialog}>
            <DialogTrigger render={<Button className="w-full" />}>
                <Plus /> Create New Board
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold">Whiteboard Workspace Name</DialogTitle>

                </DialogHeader>
                <div>
                    <label className="text-gray-500">Enter Whiteboard Workspace Name</label>
                    <Input placeholder="Workspace Name" className="mt-1"
                        onChange={(e) => setWorkspaceName(e.target.value)}
                    />
                </div>

                <DialogFooter>
                    <DialogClose render={<Button variant="outline" />}>
                        Cancel
                    </DialogClose>
                    <Button
                        disabled={workspaceName?.length == 0 || loading}
                        onClick={handleCreateBoard}>
                        {loading && <Loader2 className='animate-spin' />}
                        Create</Button>
                </DialogFooter>
            </DialogContent>


        </Dialog>
    )
}

export default CreateNewBoardDialog
