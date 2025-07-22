"use client"

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/router";

import {
    DefaultValues,
    FieldValues,
    Path,
    SubmitHandler,
    useForm,
} from "react-hook-form";

import { z, ZodType } from "zod";

import { Button } from "@/components/ui/button";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,

} from  "@/components/ui/form";

import { Input } from "@/components/ui/input";
import  ROUTES from "@/constants/routes";
import { toast } from "@/hooks/use-toast";

interface AuthFormProps<T extends FieldValues>{
    schema:ZodType<T>,
    defaultValues:T,
    formType:"SIGN_IN" | "SIGN_UP",
    onSubmit: (data: T) => Promise<ActionResponse>;

}
const AuthForm = <T extends FieldValues>({
    schema,
    defaultValues,
    formType,
    onSubmit,
}: AuthFormProps<T>) => {
    const router = useRouter();
    
    const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });
}

export default AuthForm;





